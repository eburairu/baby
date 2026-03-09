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
