import os

SESSION_EXPIRE_DAYS = 7
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true").lower() == "true"
