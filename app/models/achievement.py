from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func, Index
from app.models.base import Base


class BabyAchievement(Base):
    """赤ちゃんが解除した実績を記録するテーブル"""
    __tablename__ = "baby_achievements"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(String(50), nullable=False)
    achieved_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    triggered_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        UniqueConstraint("baby_id", "achievement_id", name="uix_baby_achievement"),
        Index("idx_baby_achievements_baby_id", "baby_id"),
    )
