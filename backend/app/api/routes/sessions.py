from datetime import date, datetime
from io import StringIO

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.workout import RoutineExercise, WorkoutRoutine, WorkoutSession, WorkoutSet
from app.schemas.workout import SessionCreate, SessionRead, SessionUpdate, TodayWorkoutResponse
from app.services.workouts import create_session_from_routine, group_session_sets, update_session


router = APIRouter()


def get_session_or_404(db: Session, session_id: int, user_id: int) -> WorkoutSession:
    session = db.scalar(
        select(WorkoutSession)
        .where(WorkoutSession.id == session_id, WorkoutSession.user_id == user_id)
        .options(selectinload(WorkoutSession.workout_sets).selectinload(WorkoutSet.exercise))
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session


@router.post("/", response_model=SessionRead)
def create_session(payload: SessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = create_session_from_routine(db, current_user.id, payload.workout_date, payload.routine_id)
    return session


@router.get("/today", response_model=TodayWorkoutResponse)
def today_workout(
    workout_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_date = workout_date or datetime.utcnow().date()
    session = db.scalar(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id, WorkoutSession.workout_date == target_date)
        .options(selectinload(WorkoutSession.workout_sets).selectinload(WorkoutSet.exercise))
    )
    routine = None
    if session and session.routine_id:
        routine = db.scalar(select(WorkoutRoutine).where(WorkoutRoutine.id == session.routine_id))
    if not session:
        scheduled = db.scalar(
            select(WorkoutRoutine)
            .where(WorkoutRoutine.user_id == current_user.id, WorkoutRoutine.day_of_week == target_date.weekday())
            .options(selectinload(WorkoutRoutine.exercises).selectinload(RoutineExercise.exercise))
        )
        if scheduled:
            session = create_session_from_routine(db, current_user.id, target_date, scheduled.id)
            routine = scheduled
    if not session:
        return TodayWorkoutResponse(date=target_date, routine=None, session=None, grouped_sets=[])

    if routine is None and session.routine_id:
        routine = db.scalar(select(WorkoutRoutine).where(WorkoutRoutine.id == session.routine_id))

    return TodayWorkoutResponse(
        date=target_date,
        routine=None if not routine else {"id": routine.id, "name": routine.name, "day_of_week": routine.day_of_week},
        session=session,
        grouped_sets=group_session_sets(session),
    )


@router.get("/", response_model=list[SessionRead])
def list_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.scalars(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id)
        .options(selectinload(WorkoutSession.workout_sets))
        .order_by(WorkoutSession.workout_date.desc())
    ).all()


@router.get("/{session_id}", response_model=SessionRead)
def get_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_session_or_404(db, session_id, current_user.id)


@router.put("/{session_id}")
def save_session(
    session_id: int,
    payload: SessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_session_or_404(db, session_id, current_user.id)
    updated, unlocked, prs = update_session(db, session, payload)
    return {"session": SessionRead.model_validate(updated), "unlocked_achievements": unlocked, "prs": prs}


@router.get("/{session_id}/export")
def export_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = get_session_or_404(db, session_id, current_user.id)
    routine_name = session.routine.name if session.routine else "Custom Session"
    buffer = StringIO()
    buffer.write("========================================\n")
    buffer.write("WORKOUT SESSION\n")
    buffer.write("========================================\n\n")
    buffer.write(f"Date: {session.workout_date.strftime('%d %B %Y')}\n")
    buffer.write(f"Workout: {routine_name}\n")
    buffer.write(f"Status: {session.status}\n\n")

    grouped = group_session_sets(session)
    for group in grouped:
        buffer.write("----------------------------------------\n")
        buffer.write(f"{group.exercise_name.upper()}\n")
        buffer.write("----------------------------------------\n\n")
        for workout_set in group.sets:
            reps = workout_set.actual_reps if workout_set.actual_reps is not None else "-"
            weight = workout_set.weight if workout_set.weight is not None else "-"
            buffer.write(f"Set {workout_set.set_number}: {weight} kg x {reps} reps\n")
        buffer.write("\n")

    buffer.write("----------------------------------------\n\n")
    buffer.write(f"Workout XP: +{session.total_xp}\n")
    buffer.write("========================================\n")
    text = buffer.getvalue()
    headers = {"Content-Disposition": f'attachment; filename="workout-session-{session.workout_date}.txt"'}
    return PlainTextResponse(text, headers=headers)
