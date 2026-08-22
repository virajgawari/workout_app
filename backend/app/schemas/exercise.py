from pydantic import BaseModel

from app.schemas.common import ORMModel


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: str
    description: str | None = None


class ExerciseUpdate(BaseModel):
    name: str
    muscle_group: str
    description: str | None = None


class ExerciseRead(ORMModel):
    id: int
    name: str
    muscle_group: str
    description: str | None = None
