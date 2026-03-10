"""
Enum definitions for the application.
"""
from enum import Enum

class RecordType(str, Enum):
    FEEDING = "feeding"
    SLEEP = "sleep"
    DIAPER = "diaper"
    GROWTH = "growth"
    NOTE = "note"
    CONTRACTION = "contraction"
    VACCINATION = "vaccination"
    MILESTONE = "milestone"

class DiaperStatus(str, Enum):
    WET = "wet"
    DIRTY = "dirty"
    BOTH = "both"

class FeedingMethod(str, Enum):
    BREAST = "breast"
    BOTTLE = "bottle"
    PUMP = "pump"

class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

class Gender(str, Enum):
    BOY = "boy"
    GIRL = "girl"
    UNKNOWN = "unknown"

class FeedingType(str, Enum):
    BREAST = "BREAST"
    BOTTLE = "BOTTLE"
    MIXED = "MIXED"

class BreastSide(str, Enum):
    LEFT = "LEFT"
    RIGHT = "RIGHT"
    BOTH = "BOTH"

class BottleContentType(str, Enum):
    FORMULA = "FORMULA"
    EXPRESSED_MILK = "EXPRESSED_MILK"
    MIXED = "MIXED"

class FeedingCompletion(str, Enum):
    FULL = "FULL"
    PARTIAL = "PARTIAL"

class DiaperType(str, Enum):
    WET = "WET"
    DIRTY = "DIRTY"
    BOTH = "BOTH"

class TemperatureMethod(str, Enum):
    AXILLARY = "AXILLARY"   # わきの下
    EAR = "EAR"             # 耳
    FOREHEAD = "FOREHEAD"   # 額
    RECTAL = "RECTAL"       # 直腸

class VaccinationStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    POSTPONED = "postponed"
