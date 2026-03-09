from datetime import datetime, date, timedelta, timezone
from app.utils.timezone import get_jst_now, get_jst_today, JST

def test_get_jst_now():
    now = get_jst_now()
    assert now.tzinfo == JST
    # 実行タイミングによるわずかなズレを許容してチェック
    expected_now = datetime.now(JST)
    assert abs((now - expected_now).total_seconds()) < 1

def test_get_jst_today():
    today = get_jst_today()
    assert isinstance(today, date)
    assert today == datetime.now(JST).date()
