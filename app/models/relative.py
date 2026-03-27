from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, func
from sqlalchemy.orm import relationship
from .base import Base, SoftDeleteMixin
from .enums import RelationshipType


class Relative(Base, SoftDeleteMixin):
    __tablename__ = "relatives"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    relationship_type = Column(
        Enum(RelationshipType, name="relationshiptype", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    baby = relationship("Baby", backref="relatives")
    user = relationship("User", foreign_keys=[user_id])
