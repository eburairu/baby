from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9))

def to_jst_naive(dt: datetime) -> datetime:
    """
    タイムゾーン付きの datetime を JST に変換し、naive な datetime を返す。
    すでに naive な場合はそのまま返す。
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt
    # JSTに変換してからタイムゾーン情報を削除
    return dt.astimezone(JST).replace(tzinfo=None)
