import pytest
from sqlalchemy.dialects.postgresql import JSONB

from app.models.milestone import Milestone
from app.models.ai_summary import DailySummary

def test_milestone_image_urls_type():
    col_type = Milestone.image_urls.type
    mapping = getattr(col_type, '_variant_mapping', None)
    assert mapping is not None, "Variant mapping is missing"
    assert 'postgresql' in mapping
    assert isinstance(mapping['postgresql'], JSONB)

def test_daily_summary_image_urls_type():
    col_type = DailySummary.image_urls.type
    mapping = getattr(col_type, '_variant_mapping', None)
    assert mapping is not None, "Variant mapping is missing"
    assert 'postgresql' in mapping
    assert isinstance(mapping['postgresql'], JSONB)
