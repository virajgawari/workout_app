from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.daily_habit import DailyHabit
from app.models.monthly_score import MonthlyScore
from app.models.user import User
from app.models.workout import WorkoutSession, WorkoutSet
from app.schemas.progress import ProgressResponse


router = APIRouter()


@router.get("/", response_model=ProgressResponse)
def get_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.scalars(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id)
        .options(selectinload(WorkoutSession.workout_sets).selectinload(WorkoutSet.exercise))
        .order_by(WorkoutSession.workout_date.asc())
    ).all()
    habits = db.scalars(
        select(DailyHabit).where(DailyHabit.user_id == current_user.id).order_by(DailyHabit.date.asc())
    ).all()
    monthly_scores = db.scalars(
        select(MonthlyScore).where(MonthlyScore.user_id == current_user.id).order_by(MonthlyScore.month.asc())
    ).all()

    frequency = [{"date": item.workout_date.isoformat(), "completed": 1 if item.status == "COMPLETED" else 0} for item in sessions]
    volume = []
    strength_map = defaultdict(float)
    for session in sessions:
        total_volume = 0
        for workout_set in session.workout_sets:
            if workout_set.completed and workout_set.weight and workout_set.actual_reps:
                total_volume += float(workout_set.weight) * workout_set.actual_reps
                key = workout_set.exercise.name
                strength_map[key] = max(strength_map[key], float(workout_set.weight))
        volume.append({"date": session.workout_date.isoformat(), "volume": round(total_volume, 2)})

    strength = [{"exercise": key, "best_weight": value} for key, value in strength_map.items()]
    junk = [{"date": habit.date.isoformat(), "junk_food": 1 if habit.junk_food else 0} for habit in habits]
    scores = [{"month": item.month, "score": item.total_score} for item in monthly_scores]
    return ProgressResponse(
        workout_frequency=frequency,
        workout_volume=volume,
        strength_progression=strength,
        junk_food_frequency=junk,
        monthly_scores=scores,
    )
