from datetime import datetime, timezone, timedelta, date

JST = timezone(timedelta(hours=9))

def get_jst_now() -> datetime:
    """現在時刻を JST で返す。"""
    return datetime.now(JST)

def get_jst_today() -> date:
    """現在日付を JST で返す。"""
    return get_jst_now().date()

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

def localize_naive_as_jst(v: datetime | None) -> datetime | None:
    """
    naive な datetime を JST として解釈し、timezone-aware にする。
    フロントエンドの datetime-local 入力（JST naive）を DB 保存前に変換するために使用する。
    already-aware な場合はそのまま返す。
    """
    if v is None:
        return None
    if v.tzinfo is None:
        return v.replace(tzinfo=JST)
    return v


def ensure_aware(dt: datetime, default_tz=timezone.utc) -> datetime:
    """
    datetime が naive な場合に、指定されたタイムゾーン（デフォルトは UTC）を付与して aware にする。
    すでに aware な場合はそのまま返す。
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=default_tz)
    return dt

