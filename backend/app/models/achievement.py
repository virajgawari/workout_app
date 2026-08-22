from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    icon: Mapped[str] = mapped_column(String(32), default="Trophy", nullable=False)

    user_links: Mapped[list["UserAchievement"]] = relationship(back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship(back_populates="user_links")


from app.models.user import User
