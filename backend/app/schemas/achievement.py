from datetime import datetime

from pydantic import BaseModel


class AchievementResponse(BaseModel):
    id: int
    name: str
    description: str
    xp_reward: int
    icon: str
    unlocked: bool
    unlocked_at: datetime | None = None
