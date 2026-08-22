from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    stats: Mapped["UserStats"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions: Mapped[list["WorkoutSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    habits: Mapped[list["DailyHabit"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    calendar_days: Mapped[list["CalendarDay"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    monthly_scores: Mapped[list["MonthlyScore"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class UserStats(Base):
    __tablename__ = "user_stats"
    __table_args__ = (UniqueConstraint("user_id", name="uq_user_stats_user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    healthy_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship(back_populates="stats")


from app.models.achievement import UserAchievement
from app.models.calendar_day import CalendarDay
from app.models.daily_habit import DailyHabit
from app.models.monthly_score import MonthlyScore
from app.models.workout import WorkoutSession
