import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class Family(Base):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)
    invite_code = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    family_users = relationship("FamilyUser", back_populates="family")


class FamilyUser(Base):
    __tablename__ = "family_users"

    family_id = Column(Integer, ForeignKey("families.id"), primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, nullable=False, index=True)
    role = Column(String, nullable=False)
    joined_at = Column(DateTime, nullable=False, server_default=func.now())

    family = relationship("Family", back_populates="family_users")
    user = relationship("User", back_populates="family_users")
