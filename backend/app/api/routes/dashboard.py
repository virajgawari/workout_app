from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.calendar_day import CalendarDay, DayStatus
from app.models.daily_habit import DailyHabit
from app.models.exercise import Exercise
from app.models.monthly_score import MonthlyScore
from app.models.user import User, UserStats
from app.models.workout import WorkoutRoutine, WorkoutSession, WorkoutSet
from app.schemas.dashboard import DashboardResponse, PersonalRecordItem, RecentSessionItem
from app.services.gamification import calculate_monthly_score, ensure_calendar_for_month
from app.services.workouts import create_session_from_routine, reset_today_session
from app.utils.levels import level_from_xp


router = APIRouter()


@router.post("/reset-today")
def reset_today(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = datetime.utcnow().date()
    reset_today_session(db, current_user.id, today)
    stats = db.scalar(select(UserStats).where(UserStats.user_id == current_user.id))
    return {"ok": True, "total_xp": stats.total_xp if stats else 0}


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    month: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = datetime.utcnow().date()
    month_key = month or today.strftime("%Y-%m")
    year, month_number = map(int, month_key.split("-"))
    month_start = date(year, month_number, 1)
    next_month = date(year + 1, 1, 1) if month_number == 12 else date(year, month_number + 1, 1)
    ensure_calendar_for_month(db, current_user.id, month_start)

    today_session = db.scalar(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id, WorkoutSession.workout_date == today)
        .options(selectinload(WorkoutSession.workout_sets).selectinload(WorkoutSet.exercise))
    )
    if not today_session:
        routine = db.scalar(
            select(WorkoutRoutine).where(WorkoutRoutine.user_id == current_user.id, WorkoutRoutine.day_of_week == today.weekday())
        )
        if routine:
            today_session = create_session_from_routine(db, current_user.id, today, routine.id)

    monthly_score = calculate_monthly_score(db, current_user.id, month_key)
    records = db.execute(
        select(Exercise.name, func.max(WorkoutSet.weight), func.max(WorkoutSet.actual_reps))
        .join(WorkoutSet, WorkoutSet.exercise_id == Exercise.id)
        .join(WorkoutSession, WorkoutSet.session_id == WorkoutSession.id)
        .where(WorkoutSession.user_id == current_user.id)
        .group_by(Exercise.name)
        .order_by(func.max(WorkoutSet.weight).desc().nullslast(), func.max(WorkoutSet.actual_reps).desc().nullslast())
    ).all()
    sessions = db.scalars(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id)
        .options(selectinload(WorkoutSession.routine))
        .order_by(WorkoutSession.workout_date.desc())
        .limit(6)
    ).all()
    calendar_days = db.scalars(
        select(CalendarDay)
        .where(CalendarDay.user_id == current_user.id, CalendarDay.date >= month_start, CalendarDay.date < next_month)
        .order_by(CalendarDay.date.asc())
    ).all()
    habits = db.scalars(
        select(DailyHabit)
        .where(DailyHabit.user_id == current_user.id, DailyHabit.date >= month_start, DailyHabit.date < next_month)
        .order_by(DailyHabit.date.asc())
    ).all()
    stats = db.scalar(select(UserStats).where(UserStats.user_id == current_user.id))
    level = level_from_xp(stats.total_xp if stats else 0)

    completed_this_month = len([item for item in calendar_days if item.status == DayStatus.completed])
    clean_days = len([item for item in habits if not item.junk_food])
    scheduled_days = len([item for item in calendar_days if item.day_type == "WORKOUT"])

    return DashboardResponse(
        today_summary={
            "date": today.isoformat(),
            "routine_name": today_session.routine.name if today_session and today_session.routine else "Rest / No routine",
            "status": today_session.status if today_session else "NONE",
            "completion_percent": today_session.completion_percent if today_session else 0,
            "session_id": today_session.id if today_session else None,
        },
        stats={
            "current_streak": stats.current_streak if stats else 0,
            "longest_streak": stats.longest_streak if stats else 0,
            "healthy_streak": stats.healthy_streak if stats else 0,
            "total_xp": stats.total_xp if stats else 0,
            "level": level,
            "monthly_workouts_completed": completed_this_month,
            "junk_food_free_days": clean_days,
            "completion_percentage": int((completed_this_month / max(scheduled_days, 1)) * 100),
        },
        monthly_score={
            "month": month_key,
            "total_score": monthly_score.total_score,
            "workout_score": monthly_score.workout_score,
            "consistency_score": monthly_score.consistency_score,
            "nutrition_score": monthly_score.nutrition_score,
            "progress_score": monthly_score.progress_score,
            "streak_score": monthly_score.streak_score,
            "rating": (
                "Beast Mode"
                if monthly_score.total_score >= 90
                else "Excellent"
                if monthly_score.total_score >= 80
                else "Good"
                if monthly_score.total_score >= 70
                else "Average"
                if monthly_score.total_score >= 60
                else "Needs Improvement"
            ),
        },
        personal_records=[
            PersonalRecordItem(
                exercise_name=exercise_name,
                best_weight=weight,
                best_reps=reps,
                estimated_one_rm=weight,
                achieved_on=None,
            )
            for exercise_name, weight, reps in records[:5]
        ],
        recent_sessions=[
            RecentSessionItem(
                id=item.id,
                workout_date=item.workout_date,
                routine_name=item.routine.name if item.routine else None,
                status=item.status,
                total_xp=item.total_xp,
                completion_percent=item.completion_percent,
            )
            for item in sessions
        ],
        calendar=[
            {"date": item.date.isoformat(), "day_type": item.day_type, "status": item.status}
            for item in calendar_days
        ],
        progress_series={
            "workouts": [{"date": item.date.isoformat(), "status": item.status} for item in calendar_days],
            "nutrition": [{"date": item.date.isoformat(), "junk_food": item.junk_food} for item in habits],
        },
    )
