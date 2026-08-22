from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.workout import RoutineExercise, WorkoutRoutine
from app.schemas.routine import RoutineCreate, RoutineRead, RoutineUpdate


router = APIRouter()


def hydrate_routine(db: Session, routine_id: int) -> WorkoutRoutine:
    routine = db.scalar(
        select(WorkoutRoutine)
        .where(WorkoutRoutine.id == routine_id)
        .options(selectinload(WorkoutRoutine.exercises).selectinload(RoutineExercise.exercise))
    )
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found.")
    return routine


@router.get("/", response_model=list[RoutineRead])
def list_routines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.scalars(
        select(WorkoutRoutine)
        .where(WorkoutRoutine.user_id == current_user.id)
        .options(selectinload(WorkoutRoutine.exercises).selectinload(RoutineExercise.exercise))
        .order_by(WorkoutRoutine.day_of_week.asc(), WorkoutRoutine.name.asc())
    ).all()


@router.post("/", response_model=RoutineRead, status_code=status.HTTP_201_CREATED)
def create_routine(payload: RoutineCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    routine = WorkoutRoutine(
        user_id=current_user.id,
        name=payload.name,
        day_of_week=payload.day_of_week,
        notes=payload.notes,
    )
    db.add(routine)
    db.flush()
    for item in payload.exercises:
        db.add(RoutineExercise(routine_id=routine.id, **item.model_dump()))
    db.commit()
    return hydrate_routine(db, routine.id)


@router.put("/{routine_id}", response_model=RoutineRead)
def update_routine(
    routine_id: int,
    payload: RoutineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    routine = db.scalar(select(WorkoutRoutine).where(WorkoutRoutine.id == routine_id, WorkoutRoutine.user_id == current_user.id))
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found.")
    routine.name = payload.name
    routine.day_of_week = payload.day_of_week
    routine.notes = payload.notes
    for item in list(routine.exercises):
        db.delete(item)
    db.flush()
    for item in payload.exercises:
        db.add(RoutineExercise(routine_id=routine.id, **item.model_dump()))
    db.add(routine)
    db.commit()
    return hydrate_routine(db, routine.id)


@router.delete("/{routine_id}")
def delete_routine(routine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    routine = db.scalar(select(WorkoutRoutine).where(WorkoutRoutine.id == routine_id, WorkoutRoutine.user_id == current_user.id))
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found.")
    db.delete(routine)
    db.commit()
    return {"message": "Routine deleted."}
