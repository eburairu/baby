from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Index, Enum
from sqlalchemy.orm import relationship
from .base import Base, SoftDeleteMixin
from app.models.enums import UserRole


class Family(Base, SoftDeleteMixin):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String, nullable=False)
    invite_code = Column(String, unique=True, index=True, nullable=False)
    invite_code_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    family_users = relationship("FamilyUser", back_populates="family")

    __table_args__ = (
        Index("ix_families_id_is_deleted", "id", "is_deleted"),
    )


class FamilyUser(Base):
    __tablename__ = "family_users"

    family_id = Column(Integer, ForeignKey("families.id"), primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, nullable=False, index=True)
    role = Column(Enum(UserRole, name="userrole", values_callable=lambda x: [e.value for e in x]), nullable=False)
    joined_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    family = relationship("Family", back_populates="family_users")
    user = relationship("User", back_populates="family_users")
