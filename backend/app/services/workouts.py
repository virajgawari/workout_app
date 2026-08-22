from collections import defaultdict
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.calendar_day import CalendarDay, DayStatus
from app.models.daily_habit import DailyHabit
from app.models.exercise import Exercise
from app.models.user import UserStats
from app.models.workout import RoutineExercise, WorkoutRoutine, WorkoutSession, WorkoutSet, WorkoutStatus
from app.utils.levels import level_from_xp
from app.schemas.workout import WorkoutExerciseGroup
from app.services.gamification import (
    PR_BONUS_XP,
    calculate_monthly_score,
    compute_healthy_streak,
    compute_streak,
    detect_personal_records,
    recalculate_total_xp,
    unlock_achievements,
    update_calendar_status_for_session,
)


def create_session_from_routine(db: Session, user_id: int, workout_date: date, routine_id: int | None = None) -> WorkoutSession:
    existing = db.scalar(
        select(WorkoutSession).where(WorkoutSession.user_id == user_id, WorkoutSession.workout_date == workout_date)
    )
    if existing:
        return existing

    if routine_id:
        routine = db.scalar(
            select(WorkoutRoutine)
            .where(WorkoutRoutine.id == routine_id, WorkoutRoutine.user_id == user_id)
            .options(selectinload(WorkoutRoutine.exercises).selectinload(RoutineExercise.exercise))
        )
    else:
        routine = db.scalar(
            select(WorkoutRoutine)
            .where(WorkoutRoutine.user_id == user_id, WorkoutRoutine.day_of_week == workout_date.weekday())
            .options(selectinload(WorkoutRoutine.exercises).selectinload(RoutineExercise.exercise))
        )

    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No routine scheduled for that day.")

    session = WorkoutSession(user_id=user_id, routine_id=routine.id, workout_date=workout_date, status=WorkoutStatus.planned)
    db.add(session)
    db.flush()
    for routine_exercise in routine.exercises:
        for set_number in range(1, routine_exercise.sets + 1):
            db.add(
                WorkoutSet(
                    session_id=session.id,
                    exercise_id=routine_exercise.exercise_id,
                    set_number=set_number,
                    target_reps=routine_exercise.target_reps,
                    weight=routine_exercise.target_weight,
                    completed=False,
                )
            )
    db.commit()
    return db.scalar(
        select(WorkoutSession)
        .where(WorkoutSession.id == session.id)
        .options(selectinload(WorkoutSession.workout_sets).selectinload(WorkoutSet.exercise))
    )


def group_session_sets(session: WorkoutSession) -> list[WorkoutExerciseGroup]:
    grouped: dict[int, list[WorkoutSet]] = defaultdict(list)
    for workout_set in session.workout_sets:
        grouped[workout_set.exercise_id].append(workout_set)
    result = []
    for exercise_id, sets in grouped.items():
        result.append(
            WorkoutExerciseGroup(
                exercise_id=exercise_id,
                exercise_name=sets[0].exercise.name,
                target_weight=sets[0].weight,
                sets=sets,
            )
        )
    return result


def update_session(db: Session, session: WorkoutSession, payload) -> tuple[WorkoutSession, list[str], list[dict]]:
    old_session_xp = session.total_xp or 0
    existing_sets = {(item.exercise_id, item.set_number): item for item in session.workout_sets}
    completed_sets = 0
    full_target_sets = 0
    for item in payload.workout_sets:
        workout_set = existing_sets.get((item.exercise_id, item.set_number))
        if not workout_set:
            workout_set = WorkoutSet(
                session_id=session.id,
                exercise_id=item.exercise_id,
                set_number=item.set_number,
                target_reps=item.target_reps,
            )
        workout_set.target_reps = item.target_reps
        workout_set.actual_reps = item.actual_reps
        workout_set.weight = item.weight
        workout_set.completed = item.completed
        workout_set.notes = item.notes
        db.add(workout_set)
        if item.completed:
            completed_sets += 1
        if item.completed and item.actual_reps and item.actual_reps >= item.target_reps:
            full_target_sets += 1

    total_sets = max(len(payload.workout_sets), 1)
    session.status = WorkoutStatus(payload.status)
    session.notes = payload.notes
    session.completion_percent = int((completed_sets / total_sets) * 100)

    xp = 0
    if session.status == WorkoutStatus.completed:
        xp += 100
    elif session.status == WorkoutStatus.partial:
        xp += 45
    if completed_sets == total_sets:
        xp += 50
    xp += full_target_sets * 5

    prs = detect_personal_records(session)
    pr_bonus = PR_BONUS_XP if prs else 0
    new_session_xp = xp + pr_bonus
    session.total_xp = new_session_xp
    db.add(session)

    stats = db.scalar(select(UserStats).where(UserStats.user_id == session.user_id))
    if stats:
        stats.total_xp = max(0, stats.total_xp - old_session_xp + new_session_xp)
        stats.level = level_from_xp(stats.total_xp)["level"]
        calendar_day = update_calendar_status_for_session(db, session)
        current_streak, longest_streak = compute_streak(db, session.user_id, session.workout_date)
        stats.current_streak = current_streak
        stats.longest_streak = max(stats.longest_streak, longest_streak)
        db.add(calendar_day)
        db.add(stats)

    unlocked = unlock_achievements(db, session.user_id)
    calculate_monthly_score(db, session.user_id, session.workout_date.strftime("%Y-%m"))
    db.commit()
    db.refresh(session)
    return session, unlocked, prs


def reset_today_session(db: Session, user_id: int, target_date: date) -> WorkoutSession | None:
    stats = db.scalar(select(UserStats).where(UserStats.user_id == user_id))

    session = db.scalar(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == user_id, WorkoutSession.workout_date == target_date)
        .options(selectinload(WorkoutSession.workout_sets))
    )
    if session:
        session.status = WorkoutStatus.planned
        session.completion_percent = 0
        session.total_xp = 0
        session.notes = None
        for workout_set in session.workout_sets:
            workout_set.completed = False
            workout_set.actual_reps = None
            workout_set.notes = None
            db.add(workout_set)
        db.add(session)

    habit = db.scalar(select(DailyHabit).where(DailyHabit.user_id == user_id, DailyHabit.date == target_date))
    if habit:
        db.delete(habit)

    calendar_day = db.scalar(
        select(CalendarDay).where(CalendarDay.user_id == user_id, CalendarDay.date == target_date)
    )
    if calendar_day:
        calendar_day.status = DayStatus.none
        db.add(calendar_day)

    if stats:
        stats.total_xp = recalculate_total_xp(db, user_id)
        stats.level = level_from_xp(stats.total_xp)["level"]
        stats.healthy_streak = compute_healthy_streak(db, user_id, target_date - timedelta(days=1))
        current_streak, longest_streak = compute_streak(db, user_id, target_date)
        stats.current_streak = current_streak
        stats.longest_streak = max(stats.longest_streak, longest_streak)
        db.add(stats)

    calculate_monthly_score(db, user_id, target_date.strftime("%Y-%m"))
    db.commit()
    if session:
        db.refresh(session)
    if stats:
        db.refresh(stats)
    return session
