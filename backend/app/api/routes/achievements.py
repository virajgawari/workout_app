from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.achievement import Achievement, UserAchievement
from app.models.user import User
from app.schemas.achievement import AchievementResponse


router = APIRouter()


@router.get("/", response_model=list[AchievementResponse])
def list_achievements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    achievements = db.scalars(select(Achievement).order_by(Achievement.id.asc())).all()
    unlocked = {
        item.achievement_id: item
        for item in db.scalars(select(UserAchievement).where(UserAchievement.user_id == current_user.id)).all()
    }
    return [
        AchievementResponse(
            id=item.id,
            name=item.name,
            description=item.description,
            xp_reward=item.xp_reward,
            icon=item.icon,
            unlocked=item.id in unlocked,
            unlocked_at=unlocked[item.id].unlocked_at if item.id in unlocked else None,
        )
        for item in achievements
    ]
