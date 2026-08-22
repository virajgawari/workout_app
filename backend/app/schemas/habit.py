from datetime import date

from pydantic import BaseModel

from app.schemas.common import ORMModel


class HabitUpsert(BaseModel):
    date: date
    junk_food: bool
    notes: str | None = None


class HabitRead(ORMModel):
    id: int
    date: date
    junk_food: bool
    notes: str | None = None
