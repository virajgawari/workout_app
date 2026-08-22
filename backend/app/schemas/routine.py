from decimal import Decimal

from pydantic import BaseModel

from app.schemas.common import ORMModel
from app.schemas.exercise import ExerciseRead


class RoutineExerciseCreate(BaseModel):
    exercise_id: int
    sets: int
    target_reps: int
    target_weight: Decimal | None = None
    notes: str | None = None
    order_index: int


class RoutineCreate(BaseModel):
    name: str
    day_of_week: int
    notes: str | None = None
    exercises: list[RoutineExerciseCreate]


class RoutineUpdate(RoutineCreate):
    pass


class RoutineExerciseRead(ORMModel):
    id: int
    sets: int
    target_reps: int
    target_weight: Decimal | None = None
    notes: str | None = None
    order_index: int
    exercise: ExerciseRead


class RoutineRead(ORMModel):
    id: int
    name: str
    day_of_week: int
    notes: str | None = None
    exercises: list[RoutineExerciseRead]
