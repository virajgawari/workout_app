from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DailyHabit(Base):
    __tablename__ = "daily_habits"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_daily_habit_user_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    junk_food: Mapped[bool] = mapped_column(Boolean, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="habits")


from app.models.user import User
