from datetime import date
from enum import Enum

from sqlalchemy import Date, Enum as SqlEnum, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DayType(str, Enum):
    workout = "WORKOUT"
    rest = "REST"
    holiday = "HOLIDAY"
    vacation = "VACATION"


class DayStatus(str, Enum):
    none = "NONE"
    completed = "COMPLETED"
    partial = "PARTIAL"
    missed = "MISSED"


class CalendarDay(Base):
    __tablename__ = "calendar_days"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_calendar_day_user_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    day_type: Mapped[DayType] = mapped_column(SqlEnum(DayType), nullable=False, default=DayType.workout)
    status: Mapped[DayStatus] = mapped_column(SqlEnum(DayStatus), nullable=False, default=DayStatus.none)

    user: Mapped["User"] = relationship(back_populates="calendar_days")


from app.models.user import User
