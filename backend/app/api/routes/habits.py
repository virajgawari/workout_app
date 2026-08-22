from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.daily_habit import DailyHabit
from app.models.user import User, UserStats
from app.schemas.habit import HabitRead, HabitUpsert
from app.services.gamification import apply_habit_rewards, calculate_monthly_score, unlock_achievements


router = APIRouter()


@router.get("/", response_model=list[HabitRead])
def list_habits(
    month: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(DailyHabit).where(DailyHabit.user_id == current_user.id)
    if month:
        year, month_number = map(int, month.split("-"))
        month_start = date(year, month_number, 1)
        next_month = date(year + 1, 1, 1) if month_number == 12 else date(year, month_number + 1, 1)
        query = query.where(DailyHabit.date >= month_start, DailyHabit.date < next_month)
    return db.scalars(query.order_by(DailyHabit.date.desc())).all()


@router.put("/", response_model=HabitRead)
def upsert_habit(payload: HabitUpsert, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = db.scalar(select(DailyHabit).where(DailyHabit.user_id == current_user.id, DailyHabit.date == payload.date))
    if not habit:
        habit = DailyHabit(user_id=current_user.id, **payload.model_dump())
    else:
        habit.junk_food = payload.junk_food
        habit.notes = payload.notes

    db.add(habit)
    stats = db.scalar(select(UserStats).where(UserStats.user_id == current_user.id))
    if stats:
        apply_habit_rewards(db, stats, habit)
        db.add(stats)
    db.commit()
    unlock_achievements(db, current_user.id)
    calculate_monthly_score(db, current_user.id, payload.date.strftime("%Y-%m"))
    db.commit()
    db.refresh(habit)
    return habit
