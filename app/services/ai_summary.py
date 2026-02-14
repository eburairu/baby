import os
from datetime import date, datetime, timedelta, timezone
from typing import Tuple
from sqlalchemy.orm import Session
from openai import OpenAI

from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth


def get_llm_client() -> Tuple[OpenAI, str]:
    """(client, model_name) を返す"""
    provider = os.environ.get("LLM_PROVIDER", "openai").lower()
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
        model = model or "gpt-4o-mini"

    return client, model


def build_daily_prompt(
    db: Session,
    baby_id: int,
    baby_name: str,
    target_date: date,
) -> Tuple[str, int]:
    """プロンプト文字列と記録件数の合計を返す。"""
    # JST の日付範囲を UTC に変換して DateTime フィルタ用に使用
    JST = timezone(timedelta(hours=9))
    day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=JST)
    day_end = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, tzinfo=JST)

    feedings = (
        db.query(Feeding)
        .filter(
            Feeding.baby_id == baby_id,
            Feeding.feeding_time >= day_start,
            Feeding.feeding_time <= day_end,
        )
        .order_by(Feeding.feeding_time)
        .all()
    )

    sleeps = (
        db.query(Sleep)
        .filter(
            Sleep.baby_id == baby_id,
            Sleep.start_time >= day_start,
            Sleep.start_time <= day_end,
        )
        .order_by(Sleep.start_time)
        .all()
    )

    diapers = (
        db.query(Diaper)
        .filter(
            Diaper.baby_id == baby_id,
            Diaper.change_time >= day_start,
            Diaper.change_time <= day_end,
        )
        .order_by(Diaper.change_time)
        .all()
    )

    growths = (
        db.query(Growth)
        .filter(
            Growth.baby_id == baby_id,
            Growth.date == target_date,
        )
        .all()
    )

    total_records = len(feedings) + len(sleeps) + len(diapers) + len(growths)

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
                lines.append(f"  {start}〜{end}（{mins}分）")
            else:
                lines.append(f"  {start}〜（継続中）")
        lines.append("")

    if diapers:
        lines.append(f"【おむつ】{len(diapers)}回")
        for d in diapers:
            t = d.change_time.strftime("%H:%M")
            kind = {"WET": "おしっこ", "DIRTY": "うんち", "BOTH": "両方"}.get(
                str(d.diaper_type.value) if hasattr(d.diaper_type, "value") else str(d.diaper_type), str(d.diaper_type)
            )
            lines.append(f"  {t} {kind}")
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

    prompt = f"""以下は赤ちゃんの育児記録です。この記録をもとに、親が読んで温かい気持ちになれるような育児日誌を300〜400字程度で書いてください。

記録の羅列ではなく、1日の流れを物語風にまとめ、赤ちゃんの様子や成長を感じられる文章にしてください。

{records_text}
育児日誌（100〜200字）:"""

    return prompt, total_records


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
    prompt, total_records = build_daily_prompt(db, baby_id, baby_name, target_date)

    if total_records == 0:
        raise ValueError("この日の育児記録がありません。")

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
    return content.strip(), model_name
