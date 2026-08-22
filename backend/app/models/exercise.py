from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    muscle_group: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    routine_links: Mapped[list["RoutineExercise"]] = relationship(back_populates="exercise")
    sets: Mapped[list["WorkoutSet"]] = relationship(back_populates="exercise")


from app.models.workout import RoutineExercise, WorkoutSet
