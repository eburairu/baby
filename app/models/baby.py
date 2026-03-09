from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Boolean, UniqueConstraint, func, Index, Enum
from sqlalchemy.orm import relationship
from .base import Base, SoftDeleteMixin
from .enums import Gender

class Baby(Base, SoftDeleteMixin):
    __tablename__ = "babies"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    birthday = Column(Date, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    due_date = Column(Date, nullable=True)
    gender = Column(Enum(Gender, name="gender"), nullable=True)
    characteristics = Column(String, nullable=True)  # AIが生成・更新する「赤ちゃんの特徴・傾向」
    feeding_threshold_minutes = Column(Integer, nullable=True)
    diaper_threshold_minutes = Column(Integer, nullable=True)

    family = relationship("Family", backref="babies")

    __table_args__ = (
        Index("ix_babies_baby_id_is_deleted", "id", "is_deleted"),
    )


class BabyPermission(Base):
    __tablename__ = "baby_permissions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    record_type = Column(String, nullable=False)
    can_view = Column(Boolean, nullable=False)

    __table_args__ = (
        UniqueConstraint("baby_id", "user_id", "record_type", name="uix_baby_user_record_type"),
    )
