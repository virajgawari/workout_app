from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkoutStatus(str, Enum):
    planned = "PLANNED"
    completed = "COMPLETED"
    partial = "PARTIAL"
    skipped = "SKIPPED"


class WorkoutRoutine(Base):
    __tablename__ = "workout_routines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    exercises: Mapped[list["RoutineExercise"]] = relationship(
        back_populates="routine",
        cascade="all, delete-orphan",
        order_by="RoutineExercise.order_index",
    )
    sessions: Mapped[list["WorkoutSession"]] = relationship(back_populates="routine")


class RoutineExercise(Base):
    __tablename__ = "routine_exercises"
    __table_args__ = (Index("ix_routine_exercises_routine_order", "routine_id", "order_index"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    routine_id: Mapped[int] = mapped_column(ForeignKey("workout_routines.id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False)
    sets: Mapped[int] = mapped_column(Integer, nullable=False)
    target_reps: Mapped[int] = mapped_column(Integer, nullable=False)
    target_weight: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    routine: Mapped["WorkoutRoutine"] = relationship(back_populates="exercises")
    exercise: Mapped["Exercise"] = relationship(back_populates="routine_links")


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    __table_args__ = (Index("ix_workout_sessions_user_date", "user_id", "workout_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    routine_id: Mapped[int | None] = mapped_column(ForeignKey("workout_routines.id", ondelete="SET NULL"), nullable=True)
    workout_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[WorkoutStatus] = mapped_column(SqlEnum(WorkoutStatus), default=WorkoutStatus.planned, nullable=False)
    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    completion_percent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="sessions")
    routine: Mapped["WorkoutRoutine"] = relationship(back_populates="sessions")
    workout_sets: Mapped[list["WorkoutSet"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="(WorkoutSet.exercise_id, WorkoutSet.set_number)",
    )


class WorkoutSet(Base):
    __tablename__ = "workout_sets"
    __table_args__ = (Index("ix_workout_sets_session_exercise_set", "session_id", "exercise_id", "set_number"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False)
    set_number: Mapped[int] = mapped_column(Integer, nullable=False)
    target_reps: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_reps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    session: Mapped["WorkoutSession"] = relationship(back_populates="workout_sets")
    exercise: Mapped["Exercise"] = relationship(back_populates="sets")


from app.models.exercise import Exercise
from app.models.user import User
