from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.calendar_day import CalendarDay, DayType
from app.models.user import User
from app.schemas.calendar import CalendarDayRead, CalendarDayUpdate
from app.services.gamification import calculate_monthly_score, ensure_calendar_for_month


router = APIRouter()


@router.get("/", response_model=list[CalendarDayRead])
def get_calendar(
    month: str = Query(..., description="YYYY-MM"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    year, month_number = map(int, month.split("-"))
    month_start = date(year, month_number, 1)
    next_month = date(year + 1, 1, 1) if month_number == 12 else date(year, month_number + 1, 1)
    ensure_calendar_for_month(db, current_user.id, month_start)
    return db.scalars(
        select(CalendarDay)
        .where(CalendarDay.user_id == current_user.id, CalendarDay.date >= month_start, CalendarDay.date < next_month)
        .order_by(CalendarDay.date.asc())
    ).all()


@router.put("/day", response_model=CalendarDayRead)
def update_calendar_day(payload: CalendarDayUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    day = db.scalar(select(CalendarDay).where(CalendarDay.user_id == current_user.id, CalendarDay.date == payload.date))
    if not day:
        day = CalendarDay(user_id=current_user.id, date=payload.date)
    day.day_type = DayType(payload.day_type)
    db.add(day)
    db.commit()
    calculate_monthly_score(db, current_user.id, payload.date.strftime("%Y-%m"))
    db.refresh(day)
    return day
