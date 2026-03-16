from app.routers.auth import login_limiter, change_password_limiter, register_limiter
from app.routers.ai_feedback import record_feedback_limiter
from app.routers.comments import comment_limiter
from app.routers.notifications import test_notification_limiter
from app.routers.family import reset_password_limiter, join_family_limiter
from app.routers.ai_summary import daily_summary_limiter
from app.routers.upload import upload_limiter
from app.routers.vaccinations import vaccination_generate_limiter
from app.core import constants

def test_rate_limit_constants_usage():
    # Auth
    assert login_limiter.requests_limit == constants.RATE_LIMIT_LOGIN_REQUESTS
    assert login_limiter.time_window == constants.RATE_LIMIT_LOGIN_WINDOW
    
    assert change_password_limiter.requests_limit == constants.RATE_LIMIT_CHANGE_PASSWORD_REQUESTS
    assert change_password_limiter.time_window == constants.RATE_LIMIT_CHANGE_PASSWORD_WINDOW
    
    assert register_limiter.requests_limit == constants.RATE_LIMIT_REGISTER_REQUESTS
    assert register_limiter.time_window == constants.RATE_LIMIT_REGISTER_WINDOW
    
    # AI Feedback
    assert record_feedback_limiter.requests_limit == constants.RATE_LIMIT_AI_FEEDBACK_REQUESTS
    assert record_feedback_limiter.time_window == constants.RATE_LIMIT_AI_FEEDBACK_WINDOW
    
    # Comments
    assert comment_limiter.requests_limit == constants.RATE_LIMIT_COMMENT_REQUESTS
    assert comment_limiter.time_window == constants.RATE_LIMIT_COMMENT_WINDOW

    # Notifications
    assert test_notification_limiter.requests_limit == constants.RATE_LIMIT_NOTIFICATION_REQUESTS
    assert test_notification_limiter.time_window == constants.RATE_LIMIT_NOTIFICATION_WINDOW

    # Family
    assert reset_password_limiter.requests_limit == constants.RATE_LIMIT_RESET_PASSWORD_REQUESTS
    assert reset_password_limiter.time_window == constants.RATE_LIMIT_RESET_PASSWORD_WINDOW

    # AI Summary
    assert daily_summary_limiter.requests_limit == constants.RATE_LIMIT_AI_SUMMARY_REQUESTS
    assert daily_summary_limiter.time_window == constants.RATE_LIMIT_AI_SUMMARY_WINDOW

    # Upload
    assert upload_limiter.requests_limit == constants.RATE_LIMIT_UPLOAD_REQUESTS
    assert upload_limiter.time_window == constants.RATE_LIMIT_UPLOAD_WINDOW

    # Vaccinations
    assert vaccination_generate_limiter.requests_limit == constants.RATE_LIMIT_VACCINATION_GENERATE_REQUESTS
    assert vaccination_generate_limiter.time_window == constants.RATE_LIMIT_VACCINATION_GENERATE_WINDOW

    # Family join (brute force protection)
    assert join_family_limiter.requests_limit == constants.RATE_LIMIT_JOIN_FAMILY_REQUESTS
    assert join_family_limiter.time_window == constants.RATE_LIMIT_JOIN_FAMILY_WINDOW
