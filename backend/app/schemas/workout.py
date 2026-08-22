from datetime import date
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.common import ORMModel


class WorkoutSetUpdate(BaseModel):
    id: int | None = None
    exercise_id: int
    set_number: int
    target_reps: int
    actual_reps: int | None = None
    weight: Decimal | None = None
    completed: bool
    notes: str | None = None


class SessionCreate(BaseModel):
    workout_date: date
    routine_id: int | None = None


class SessionUpdate(BaseModel):
    status: str
    notes: str | None = None
    workout_sets: list[WorkoutSetUpdate]


class WorkoutSetRead(ORMModel):
    id: int
    exercise_id: int
    set_number: int
    target_reps: int
    actual_reps: int | None = None
    weight: Decimal | None = None
    completed: bool
    notes: str | None = None


class WorkoutExerciseGroup(BaseModel):
    exercise_id: int
    exercise_name: str
    target_weight: Decimal | None = None
    sets: list[WorkoutSetRead]


class SessionRead(ORMModel):
    id: int
    routine_id: int | None = None
    workout_date: date
    status: str
    total_xp: int
    notes: str | None = None
    completion_percent: int
    workout_sets: list[WorkoutSetRead]


class TodayWorkoutResponse(BaseModel):
    date: date
    routine: dict | None
    session: SessionRead | None
    grouped_sets: list[WorkoutExerciseGroup]
