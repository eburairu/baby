import re
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Tuple
from app.core.constants import AI_MAX_TOKENS

import openai
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.comment import RecordComment
from app.models.feeding import Feeding
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.note import Note
from app.models.baby import Baby
from app.services.ai_summary import get_llm_client, _fetch_records_in_range
from app.services.ai_settings import get_ai_config
from app.services.baby import get_baby_age_in_days
from app.utils.timezone import get_jst_now

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
このリクエストは、親が自分の赤ちゃんの健康状態を把握するための安全な育児支援の文脈で行われています。
「熱がある」「元気がない」などの体調に関する記述は、医学的な懸念を把握するための重要な情報であり、ポリシー違反ではありません。
赤ちゃんの直近の記録を分析し、親に向けて温かく簡潔なフィードバックを日本語で返してください。
JSON形式のみで返してください。Markdownのコードブロック（```json ... ```）は使用せず、純粋なJSONテキストのみを出力してください。
返却形式:
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

def _extract_json(text: str) -> str:
    """Markdownのコードブロック等が含まれている場合にJSON部分を抽出する"""
    text = text.strip()
    # 1. Markdownコードブロックを探す
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        text = match.group(1).strip()
    else:
        # 2. 最初と最後の { } を探す (コードブロックがない、または閉じフェンス後のテキスト対策)
        start = text.find("{")
        if start != -1:
            end = text.rfind("}")
            if end != -1 and end > start:
                text = text[start : end + 1].strip()
            else:
                # 閉じ括弧がない場合でも、{ 以降を抽出対象とする（後の修復に期待）
                text = text[start:].strip()

    # 簡易修復ロジック: 閉じられていない引用符や括弧を補完
    if text.startswith("{"):
        # 引用符の数が奇数なら閉じる（エスケープは考慮しない簡易版）
        if text.count('"') % 2 != 0:
            text += '"'
        # 閉じ括弧がなければ閉じる
        if not text.endswith("}"):
            text += "}"

    return text


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
    baby: Baby,
    record_type: str,
    record_id: int,
) -> str:
    """直近24時間の全記録を取得してプロンプトを組み立てる"""
    now = get_jst_now()

    records_text = _build_records_text(db, baby_id, now)

    if record_type == "growth":
        growth_ctx = _build_growth_context(db, baby_id, record_id)
        if growth_ctx:
            records_text = records_text + "\n" + growth_ctx

    trigger_focus = TRIGGER_FOCUS.get(record_type, "全体的な状態")
    record_type_ja = RECORD_TYPE_JA.get(record_type, record_type)

    age_days = get_baby_age_in_days(baby, now.date())
    age_str = f"（生後{age_days}日）" if age_days is not None else ""

    prompt = (
        f"{baby.name}ちゃん{age_str}の記録です。今ちょうど「{record_type_ja}」を記録しました。\n\n"
        f"【直近24時間の記録】\n{records_text}\n\n"
        f"この記録を踏まえて、{trigger_focus}を中心に分析し、JSONで返してください。"
    )
    return prompt


def generate_record_feedback(
    db: Session,
    baby_id: int,
    baby: Baby,
    record_type: str,
    record_id: int,
) -> Tuple[str, bool, str]:
    """
    (feedback_text, has_concern, model_name) を返す 。
    JSON パース失敗時は has_concern=False としてフォールバック。
    """
    config = get_ai_config(db)
    if not config.get("ai_enabled_feedback", True):
        raise RuntimeError("AI 記録フィードバック機能は現在無効化されています。")

    prompt = build_feedback_prompt(db, baby_id, baby, record_type, record_id)
    client, model_name = get_llm_client(db)

    last_error: Exception = RuntimeError("no attempts made")
    for attempt in range(3):
        if attempt > 0:
            time.sleep(2 ** attempt)  # 2s, 4s
        try:
            reasoning_effort = config.get("llm_reasoning_effort")
            # "none"/"default" は送らない。Flash など非思考モデルに送ると 400 INVALID_ARGUMENT になる
            is_thinking = reasoning_effort and reasoning_effort not in ("default", "none")
            temperature = 1.0 if is_thinking else float(config.get("llm_temperature", 0.5))
            kwargs = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": int(config.get("llm_max_tokens", AI_MAX_TOKENS)),
                "temperature": temperature,
                "response_format": {"type": "json_object"},
            }

            # 思考モード時のみ reasoning_effort を送る（Pro Preview 系のみ対応）
            if is_thinking:
                kwargs["extra_body"] = {"reasoning_effort": reasoning_effort}

            response = client.chat.completions.create(**kwargs)
            break
        except openai.BadRequestError as e:
            # Gemini API は安全性フィルターでブロックした場合に 400 BadRequest を返すことがある
            if "finish_reason: SAFETY" in str(e) or "SAFETY" in str(e).upper() or "PROHIBITED_CONTENT" in str(e).upper():
                logger.error("AI feedback was blocked by safety filters: %s", e)
                return "記録を分析しましたが、現在適切なアドバイスを生成できませんでした。赤ちゃんの様子に気になる点がある場合は、直接医師にご相談ください。", True, model_name
            last_error = e
            break # リトライしない
        except (openai.RateLimitError, openai.APIConnectionError) as e:
            logger.warning("Retryable error on attempt %d: %s", attempt + 1, e)
            last_error = e
    else:
        raise last_error

    raw = (response.choices[0].message.content or "").strip()
    if not raw:
        # candidates が空の場合の対策
        return "記録を受け付けました。いつも育児お疲れ様です！", False, model_name

    json_str = _extract_json(raw)

    try:
        parsed = json.loads(json_str)
        feedback_text = str(parsed.get("feedback", raw))
        has_concern = bool(parsed.get("has_concern", False))
    except (json.JSONDecodeError, AttributeError):
        # json.loads が失敗した場合、正規表現で直接 feedback フィールドの抽出を試みる（最後の救済措置）
        match = re.search(r'"feedback":\s*"(.*?)(?:"|,\s*"|$)', json_str, re.DOTALL)
        if match:
            feedback_text = match.group(1).strip()
            logger.info("Extracted feedback using regex after JSON parse failure.")
        else:
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
