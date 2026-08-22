from collections import defaultdict
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.workout import WorkoutSession, WorkoutSet


router = APIRouter()


@router.get("/")
def personal_records(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.scalars(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id)
        .options(selectinload(WorkoutSession.workout_sets).selectinload(WorkoutSet.exercise))
        .order_by(WorkoutSession.workout_date.desc())
    ).all()

    records: dict[str, dict] = defaultdict(
        lambda: {
            "exercise_name": "",
            "best_weight": Decimal("0"),
            "best_reps": 0,
            "estimated_one_rm": Decimal("0"),
            "achieved_on": None,
        }
    )
    for session in sessions:
        for item in session.workout_sets:
            if not item.completed:
                continue
            record = records[item.exercise.name]
            record["exercise_name"] = item.exercise.name
            if item.weight and item.weight >= record["best_weight"]:
                record["best_weight"] = item.weight
                record["achieved_on"] = session.workout_date
            if item.actual_reps and item.actual_reps >= record["best_reps"]:
                record["best_reps"] = item.actual_reps
                record["achieved_on"] = session.workout_date
            if item.weight and item.actual_reps:
                estimated = item.weight * Decimal(1 + (item.actual_reps / 30))
                if estimated > record["estimated_one_rm"]:
                    record["estimated_one_rm"] = estimated.quantize(Decimal("0.01"))

    return list(records.values())
