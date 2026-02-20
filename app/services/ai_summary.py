import os
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Tuple, Type
from sqlalchemy.orm import Session
from openai import OpenAI

from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.note import Note

logger = logging.getLogger(__name__)


def get_llm_client() -> Tuple[OpenAI, str]:
    """(client, model_name) を返す"""
    provider = os.environ.get("LLM_PROVIDER", "google").lower()
    api_key = os.environ.get("LLM_API_KEY") or os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("LLM_MODEL")

    if provider == "google":
        client = OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        model = model or "gemini-2.0-flash"
    else:
        client = OpenAI(api_key=api_key)
        model = model or "gpt-4o"

    return client, model


def _fetch_records_in_range(
    db: Session,
    model_class: Type,
    baby_id: int,
    time_column,
    start_time: datetime,
    end_time: datetime,
):
    """
    指定された日時範囲内のレコードを取得するヘルパー関数。
    time_columnでソートして返す。
    """
    return (
        db.query(model_class)
        .filter(
            model_class.baby_id == baby_id,
            time_column >= start_time,
            time_column <= end_time,
        )
        .order_by(time_column)
        .all()
    )


def build_daily_prompt(
    db: Session,
    baby_id: int,
    baby_name: str,
    target_date: date,
) -> Tuple[str, int, str]:
    """プロンプト文字列、記録件数の合計、記録テキスト自体を返す。"""
    # JST の日付範囲を UTC に変換して DateTime フィルタ用に使用
    JST = timezone(timedelta(hours=9))
    day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=JST)
    day_end = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, tzinfo=JST)

    feedings = _fetch_records_in_range(
        db, Feeding, baby_id, Feeding.feeding_time, day_start, day_end
    )

    sleeps = _fetch_records_in_range(
        db, Sleep, baby_id, Sleep.start_time, day_start, day_end
    )

    diapers = _fetch_records_in_range(
        db, Diaper, baby_id, Diaper.change_time, day_start, day_end
    )

    notes = _fetch_records_in_range(
        db, Note, baby_id, Note.note_time, day_start, day_end
    )

    growths = (
        db.query(Growth)
        .filter(
            Growth.baby_id == baby_id,
            Growth.date == target_date,
        )
        .all()
    )

    total_records = len(feedings) + len(sleeps) + len(diapers) + len(notes) + len(growths)

    date_str = target_date.strftime("%Y年%m月%d日")
    lines = [f"{baby_name}ちゃんの{date_str}の育児記録です。", ""]

    if feedings:
        lines.append(f"【授乳】{len(feedings)}回")
        for f in feedings:
            t = f.feeding_time.strftime("%H:%M")
            kind = {"BREAST": "母乳", "BOTTLE": "ミルク", "MIXED": "混合"}.get(
                str(f.feeding_type.value) if hasattr(f.feeding_type, "value") else str(f.feeding_type), str(f.feeding_type)
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

    if sleeps:
        lines.append(f"【睡眠】{len(sleeps)}回")
        for s in sleeps:
            start = s.start_time.strftime("%H:%M")
            if s.end_time:
                end = s.end_time.strftime("%H:%M")
                diff = s.end_time - s.start_time
                mins = int(diff.total_seconds() / 60)
                line = f"  {start}〜{end}（{mins}分）"
            else:
                line = f"  {start}〜（継続中）"
            
            if s.notes:
                line += f" (メモ: {s.notes})"
            lines.append(line)
        lines.append("")

    if diapers:
        lines.append(f"【おむつ】{len(diapers)}回")
        for d in diapers:
            t = d.change_time.strftime("%H:%M")
            kind = {"WET": "おしっこ", "DIRTY": "うんち", "BOTH": "両方"}.get(
                str(d.diaper_type.value) if hasattr(d.diaper_type, "value") else str(d.diaper_type), str(d.diaper_type)
            )
            line = f"  {t} {kind}"
            if d.notes:
                line += f" (メモ: {d.notes})"
            lines.append(line)
        lines.append("")

    if notes:
        lines.append("【その他の様子・メモ】")
        for n in notes:
            t = n.note_time.strftime("%H:%M")
            lines.append(f"  {t} {n.content}")
        lines.append("")

    if growths:
        lines.append("【成長記録】")
        for g in growths:
            parts = []
            if g.weight is not None:
                parts.append(f"体重 {g.weight / 1000:.3f}kg")
            if g.height is not None:
                parts.append(f"身長 {g.height}cm")
            if g.head_circumference is not None:
                parts.append(f"頭囲 {g.head_circumference}cm")
            if parts:
                lines.append(f"  {' / '.join(parts)}")
        lines.append("")

    records_text = "\n".join(lines)

    prompt = f"""以下は赤ちゃんの育児記録です。この記録をもとに、親が読んで温かい気持ちになれるような育児日誌を100〜200字程度で書いてください。

記録の羅列ではなく、1日の流れを物語風にまとめ、赤ちゃんの様子や成長を感じられる文章にしてください。

{records_text}
育児日誌（100〜200字）:"""

    return prompt, total_records, records_text


def update_baby_characteristics(
    db: Session,
    baby_id: int,
    baby_name: str,
    target_date: date,
    current_characteristics: str,
    daily_record_text: str,
    generated_diary: str,
    model_name: str
) -> None:
    """日誌生成後に赤ちゃんの特徴（characteristics）を更新する。"""
    from app.models.baby import Baby

    # プロンプト構築
    update_prompt = (
        f"以下は赤ちゃん（{baby_name}）の現在記録されている「特徴・傾向」と、"
        f"本日（{target_date}）の育児記録、および生成された日記です。\n\n"
        f"【現在の特徴】\n{current_characteristics or '（なし）'}\n\n"
        f"【本日の記録】\n{daily_record_text}\n\n"
        f"【生成された日記】\n{generated_diary}\n\n"
        f"これらを踏まえて、赤ちゃんの特徴を更新してください。\n"
        f"「最近うんちが緩い」「夜泣き気味」など、数日〜数週間のスパンで続く傾向があれば残し、"
        f"解消されたものは削除するか「解消された」と更新してください。\n"
        f"一時的な出来事（今日だけミルクをこぼした等）は特徴に含めないでください。\n"
        f"出力は更新後の特徴テキストのみ（箇条書き推奨）にしてください。"
    )

    try:
        client, _ = get_llm_client()
        # 更新用モデルは軽量モデルでも良いが、指示順守のため生成と同じモデルまたは安定したモデルを使用
        # ここでは generate と同じモデルを使うか、デフォルト設定に従う
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "あなたは赤ちゃんの成長や体調の変化を長期的に観察するアシスタントです。"},
                {"role": "user", "content": update_prompt},
            ],
            max_tokens=400,
            temperature=0.5,
        )
        new_characteristics = response.choices[0].message.content.strip()

        # DB更新
        baby = db.query(Baby).filter(Baby.id == baby_id).first()
        if baby:
            from app.services.baby import update_baby
            update_baby(db, baby, {"characteristics": new_characteristics})

    except Exception as e:
        logger.error(f"Failed to update characteristics: {e}")
        # 特徴更新の失敗は日誌生成自体を失敗させない（ログ出力のみ）


def generate_daily_summary(
    db: Session,
    baby_id: int,
    baby_name: str,
    target_date: date,
) -> Tuple[str, str]:
    """(generated_content, model_name) を返す。
    記録が0件の場合は ValueError を raise。
    API障害時は openai.APIError を伝播。
    """
    prompt, total_records, records_text = build_daily_prompt(db, baby_id, baby_name, target_date)

    if total_records == 0:
        raise ValueError("この日の育児記録がありません。")

    # 現在の特徴を取得してプロンプトに追加
    from app.models.baby import Baby
    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    current_characteristics = baby.characteristics if baby else None

    if current_characteristics:
        prompt = (
            f"【これまでの赤ちゃんの様子・特徴】\n{current_characteristics}\n\n" 
            + prompt
            + "\n\n上記の特徴を踏まえつつ、本日の記録に矛盾があれば今日の記録を優先し、"
            "「いつもは〜だが今日は〜だった」のように変化に触れてください。"
        )

    client, model_name = get_llm_client()

    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": "あなたは育児記録をもとに、温かみのある育児日誌を書くアシスタントです。",
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=600,
        temperature=0.7,
    )

    content = response.choices[0].message.content or ""
    generated_text = content.strip()

    # 特徴を更新 (同期実行)
    update_baby_characteristics(
        db, 
        baby_id, 
        baby_name, 
        target_date, 
        current_characteristics, 
        records_text, 
        generated_text, 
        model_name
    )

    return generated_text, model_name
