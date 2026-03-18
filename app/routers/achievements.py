from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.achievement import BabyAchievement
from app.schemas.achievement import BabyAchievementResponse
from app.achievements.definitions import ACHIEVEMENTS

router = APIRouter(prefix="/api/achievements", tags=["achievements"])


@router.get("/", response_model=List[BabyAchievementResponse])
def get_achievements(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id)
    rows = (
        db.query(BabyAchievement)
        .filter(BabyAchievement.baby_id == baby_id)
        .order_by(BabyAchievement.achieved_at.asc())
        .all()
    )

    user_ids = {r.triggered_by_user_id for r in rows if r.triggered_by_user_id}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}

    result = []
    for row in rows:
        defn = ACHIEVEMENTS.get(row.achievement_id)
        if defn is None:
            # 削除済み実績に対するフォールバック処理
            from app.achievements.definitions import AchievementDef
            defn = AchievementDef(
                name="レガシー実績",
                icon="❓",
                description="現在は取得できない実績です",
                category="funny",
                rarity="common",
            )
            
        result.append(BabyAchievementResponse(
            id=row.id,
            baby_id=row.baby_id,
            achievement_id=row.achievement_id,
            achieved_at=row.achieved_at,
            triggered_by_display_name=user_map.get(row.triggered_by_user_id),
            name=defn.name,
            icon=defn.icon,
            category=defn.category,
            rarity=defn.rarity,
            description=defn.description,
        ))
    return result
