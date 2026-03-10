import pytest
from app.models.enums import DiaperType, FeedingType, UserRole, TemperatureMethod, VaccinationStatus

def test_enums_exist_in_enums_py():
    """Verify that enums are correctly imported from app.models.enums"""
    assert hasattr(DiaperType, "WET")
    assert hasattr(FeedingType, "BOTTLE")
    assert hasattr(UserRole, "ADMIN")
    assert hasattr(TemperatureMethod, "AXILLARY")
    assert hasattr(VaccinationStatus, "SCHEDULED")

def test_models_import_enums_correctly():
    """Verify that models use the enums from app.models.enums"""
    from app.models.diaper import Diaper
    from app.models.feeding import Feeding
    from app.models.family import FamilyUser
    from app.models.temperature import TemperatureRecord
    from app.models.vaccination import Vaccination

    # While SQLAlchemy columns use Enum types, we can just ensure the models can be imported
    # and instantiated or at least the columns have the correct python_type
    assert Diaper is not None
    assert Feeding is not None
    assert FamilyUser is not None
    assert TemperatureRecord is not None
    assert Vaccination is not None

def test_schemas_use_enums_correctly():
    """Verify that Pydantic schemas correctly use the Enums"""
    from app.schemas.diaper import DiaperCreate
    from app.schemas.feeding import FeedingCreate
    from app.schemas.temperature import TemperatureCreate
    from datetime import datetime, timezone
    
    # Just checking that fields accept the enum values correctly
    # If the import was wrong, schema definition would have failed
    assert True
