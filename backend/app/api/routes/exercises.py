from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.exercise import ExerciseCreate, ExerciseRead, ExerciseUpdate


router = APIRouter()


@router.get("/", response_model=list[ExerciseRead])
def list_exercises(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.scalars(select(Exercise).order_by(Exercise.name.asc())).all()


@router.post("/", response_model=ExerciseRead, status_code=status.HTTP_201_CREATED)
def create_exercise(payload: ExerciseCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    exercise = Exercise(**payload.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@router.put("/{exercise_id}", response_model=ExerciseRead)
def update_exercise(
    exercise_id: int,
    payload: ExerciseUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    exercise = db.get(Exercise, exercise_id)
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found.")
    for field, value in payload.model_dump().items():
        setattr(exercise, field, value)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


@router.delete("/{exercise_id}")
def delete_exercise(exercise_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    exercise = db.get(Exercise, exercise_id)
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found.")
    db.delete(exercise)
    db.commit()
    return {"message": "Exercise deleted."}
