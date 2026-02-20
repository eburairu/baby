import json
import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Tuple

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.comment import RecordComment
from app.models.feeding import Feeding
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.note import Note
from app.services.ai_summary import get_llm_client, _fetch_records_in_range

logger = logging.getLogger(__name__)

RECORD_TYPE_JA = {
    "feeding": "授乳",
    "diaper": "おむつ交換",
    "growth": "成長測定",
    "note": "メモ",
}

TRIGGER_FOCUS = {
    "feeding": "前回からの授乳間隔・今日の授乳回数や総量",
    "diaper": "今日のおむつ回数・内訳（おしっこ/うんち）と前回からの経過時間",
    "growth": "前回測定値との差分（体重・身長の増加量）",
    "note": "メモの内容を踏まえた赤ちゃん全体の状態",
}

SYSTEM_PROMPT = """あなたは育児記録アシスタントです。
赤ちゃんの直近の記録を分析し、親に向けて温かく簡潔なフィードバックを日本語で返してください。
以下のJSON形式のみで返してください（他のテキストは含めないこと）:
{"feedback": "フィードバックテキスト", "has_concern": true/false}

フィードバックは50〜150字程度、1〜2文にまとめてください。
has_concern は以下の場合に true としてください（いずれかに該当すれば）:
- 授乳間隔が6時間以上空いている（新生児〜3ヶ月）
- 直近24時間の授乳回数が5回未満（新生児期）
- おしっこが12時間以上記録されていない
- うんちが24時間で0回（または極端に少ない傾向がメモで示されている）
- 成長記録で体重が前回より有意に減少している（100g以上の減少）
- メモに「元気がない」「ぐったり」「熱がある」などの懸念ワードがある
上記に該当しない場合は has_concern: false とし、ポジティブなコメントを返してください。
医療診断は行わず「確認してみてください」「小児科に相談することをお勧めします」程度にとどめてください。"""


def _verify_record_ownership(
    db: Session, record_type: str, record_id: int, baby_id: int
) -> None:
    """record_id と baby_id の対応を確認（なりすまし防止）"""
    model_map = {
        "feeding": Feeding,
        "diaper": Diaper,
        "growth": Growth,
        "note": Note,
    }
    model = model_map.get(record_type)
    if model is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record_type")

    record = db.query(model).filter(
        model.id == record_id,
        model.baby_id == baby_id,
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{record_type} record {record_id} not found for baby {baby_id}",
        )


def _build_records_text(db: Session, baby_id: int, now: datetime) -> str:
    """直近24時間の全記録をテキスト化して返す"""
    since = now - timedelta(hours=24)
    lines: list[str] = []

    feedings = _fetch_records_in_range(db, Feeding, baby_id, Feeding.feeding_time, since, now)
    if feedings:
        lines.append(f"【授乳】{len(feedings)}回")
        for f in feedings:
            t = f.feeding_time.strftime("%H:%M")
            kind = {"BREAST": "母乳", "BOTTLE": "ミルク", "MIXED": "混合"}.get(
                str(f.feeding_type.value) if hasattr(f.feeding_type, "value") else str(f.feeding_type),
                str(f.feeding_type),
            )
            detail = f"  {t} {kind}"
            if f.amount_ml:
                detail += f" {int(f.amount_ml)}ml"
            if f.duration_minutes:
                detail += f" {f.duration_minutes}分"
            if f.notes:
                detail += f" (メモ: {f.notes})"
            lines.append(detail)
        lines.append("")

    diapers = _fetch_records_in_range(db, Diaper, baby_id, Diaper.change_time, since, now)
    if diapers:
        lines.append(f"【おむつ】{len(diapers)}回")
        for d in diapers:
            t = d.change_time.strftime("%H:%M")
            kind = {"WET": "おしっこ", "DIRTY": "うんち", "BOTH": "両方"}.get(
                str(d.diaper_type.value) if hasattr(d.diaper_type, "value") else str(d.diaper_type),
                str(d.diaper_type),
            )
            line = f"  {t} {kind}"
            if d.notes:
                line += f" (メモ: {d.notes})"
            lines.append(line)
        lines.append("")

    notes = _fetch_records_in_range(db, Note, baby_id, Note.note_time, since, now)
    if notes:
        lines.append("【メモ】")
        for n in notes:
            t = n.note_time.strftime("%H:%M")
            lines.append(f"  {t} {n.content}")
        lines.append("")

    if not lines:
        lines.append("（直近24時間の記録なし）")

    return "\n".join(lines)


def _build_growth_context(db: Session, baby_id: int, growth_id: int) -> str:
    """成長記録の場合は前回値との比較テキストを生成する"""
    current = db.query(Growth).filter(Growth.id == growth_id).first()
    if not current:
        return ""

    # 前回の成長記録（日付が古い順で直近1件）
    previous = (
        db.query(Growth)
        .filter(Growth.baby_id == baby_id, Growth.date < current.date)
        .order_by(Growth.date.desc())
        .first()
    )

    lines = []
    if previous:
        lines.append("【前回の成長記録】")
        prev_parts = []
        if previous.weight is not None:
            prev_parts.append(f"体重 {previous.weight}g")
        if previous.height is not None:
            prev_parts.append(f"身長 {previous.height}cm")
        lines.append(f"  {previous.date}: {' / '.join(prev_parts)}")

    lines.append("【今回の成長記録】")
    cur_parts = []
    if current.weight is not None:
        cur_parts.append(f"体重 {current.weight}g")
        if previous and previous.weight is not None:
            diff = current.weight - previous.weight
            sign = "+" if diff >= 0 else ""
            cur_parts[-1] += f"（前回比: {sign}{diff}g）"
    if current.height is not None:
        cur_parts.append(f"身長 {current.height}cm")
    lines.append(f"  {current.date}: {' / '.join(cur_parts)}")

    return "\n".join(lines)


def build_feedback_prompt(
    db: Session,
    baby_id: int,
    baby_name: str,
    record_type: str,
    record_id: int,
) -> str:
    """直近24時間の全記録を取得してプロンプトを組み立てる"""
    JST = timezone(timedelta(hours=9))
    now = datetime.now(JST)

    records_text = _build_records_text(db, baby_id, now)

    if record_type == "growth":
        growth_ctx = _build_growth_context(db, baby_id, record_id)
        if growth_ctx:
            records_text = records_text + "\n" + growth_ctx

    trigger_focus = TRIGGER_FOCUS.get(record_type, "全体的な状態")
    record_type_ja = RECORD_TYPE_JA.get(record_type, record_type)

    prompt = (
        f"{baby_name}ちゃんの記録です。今ちょうど「{record_type_ja}」を記録しました。\n\n"
        f"【直近24時間の記録】\n{records_text}\n\n"
        f"この記録を踏まえて、{trigger_focus}を中心に分析し、JSONで返してください。"
    )
    return prompt


def generate_record_feedback(
    db: Session,
    baby_id: int,
    baby_name: str,
    record_type: str,
    record_id: int,
) -> Tuple[str, bool, str]:
    """
    (feedback_text, has_concern, model_name) を返す。
    JSON パース失敗時は has_concern=False としてフォールバック。
    """
    prompt = build_feedback_prompt(db, baby_id, baby_name, record_type, record_id)
    client, model_name = get_llm_client()

    last_error: Exception = RuntimeError("no attempts made")
    for attempt in range(3):
        if attempt > 0:
            time.sleep(2 ** attempt)  # 2s, 4s
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=300,
                temperature=0.5,
            )
            break
        except openai.RateLimitError as e:
            logger.warning("Rate limit on attempt %d: %s", attempt + 1, e)
            last_error = e
    else:
        raise last_error

    raw = (response.choices[0].message.content or "").strip()

    try:
        parsed = json.loads(raw)
        feedback_text = str(parsed.get("feedback", raw))
        has_concern = bool(parsed.get("has_concern", False))
    except (json.JSONDecodeError, AttributeError):
        logger.warning("AI response was not valid JSON, using raw text: %s", raw[:100])
        feedback_text = raw
        has_concern = False

    return feedback_text, has_concern, model_name


def save_ai_comment(
    db: Session,
    record_type: str,
    record_id: int,
    baby_id: int,
    feedback: str,
    has_concern: bool,
) -> RecordComment:
    """フィードバックをコメントとして保存する（user_id=None, is_ai_generated=True）"""
    comment = RecordComment(
        baby_id=baby_id,
        user_id=None,
        record_type=record_type,
        record_id=record_id,
        content=feedback,
        is_ai_generated=True,
        ai_has_concern=has_concern,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
