import pytest
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableList

from app.models.milestone import Milestone
from app.models.ai_summary import DailySummary

def test_milestone_image_urls_type():
    col_type = Milestone.image_urls.type
    
    # Extract the underlying type inside MutableList if it is one
    if hasattr(col_type, 'impl'):
        base_type = col_type.impl
    else:
        base_type = col_type
        
    mapping = getattr(base_type, '_variant_mapping', None)
    assert mapping is not None, "Variant mapping is missing"
    assert 'postgresql' in mapping
    assert isinstance(mapping['postgresql'], JSONB)
    
def test_milestone_image_urls_is_mutable_list():
    m = Milestone()
    m.image_urls = []
    assert isinstance(m.image_urls, MutableList), "Milestone.image_urls did not convert list to MutableList"

def test_daily_summary_image_urls_type():
    col_type = DailySummary.image_urls.type
    
    if hasattr(col_type, 'impl'):
        base_type = col_type.impl
    else:
        base_type = col_type
        
    mapping = getattr(base_type, '_variant_mapping', None)
    assert mapping is not None, "Variant mapping is missing"
    assert 'postgresql' in mapping
    assert isinstance(mapping['postgresql'], JSONB)

def test_daily_summary_image_urls_is_mutable_list():
    ds = DailySummary()
    ds.image_urls = []
    assert isinstance(ds.image_urls, MutableList), "DailySummary.image_urls did not convert list to MutableList"
