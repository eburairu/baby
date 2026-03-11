import pytest
from app.models.enums import NotificationType
import app.core.constants as constants

def test_constants_exist():
    assert constants.DEFAULT_PAGINATION_LIMIT == 20
    assert constants.API_TIMEOUT_MS == 30000

def test_notification_type_enum():
    assert NotificationType.family_record.value == "family_record"
