from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.achievement import Achievement, UserAchievement
from app.models.calendar_day import CalendarDay, DayStatus, DayType
from app.models.daily_habit import DailyHabit
from app.models.exercise import Exercise
from app.models.monthly_score import MonthlyScore
from app.models.user import UserStats
from app.models.workout import WorkoutRoutine, WorkoutSession, WorkoutSet, WorkoutStatus
from app.utils.levels import level_from_xp


ACHIEVEMENTS = [
    ("First Workout", "Complete your first workout.", 100, "Award"),
    ("7 Day Warrior", "Complete 7 scheduled workouts consecutively.", 150, "Flame"),
    ("100 Workouts", "Complete 100 workouts.", 300, "Dumbbell"),
    ("Clean Week", "Avoid junk food for 7 days.", 120, "Salad"),
    ("New PR", "Set a new personal record.", 75, "Trophy"),
    ("30 Day Beast", "Maintain a 30-day workout consistency streak.", 400, "Crown"),
]

HABIT_CLEAN_XP = 25
PR_BONUS_XP = 75


def seed_achievements(db: Session) -> None:
    for name, description, xp_reward, icon in ACHIEVEMENTS:
        if not db.scalar(select(Achievement).where(Achievement.name == name)):
            db.add(Achievement(name=name, description=description, xp_reward=xp_reward, icon=icon))
    db.commit()


def add_xp(db: Session, stats: UserStats, amount: int) -> dict:
    stats.total_xp += amount
    level_data = level_from_xp(stats.total_xp)
    stats.level = level_data["level"]
    db.add(stats)
    return level_data


def recalculate_total_xp(db: Session, user_id: int) -> int:
    session_xp = db.scalar(
        select(func.coalesce(func.sum(WorkoutSession.total_xp), 0)).where(WorkoutSession.user_id == user_id)
    )
    clean_habits = db.scalar(
        select(func.count())
        .select_from(DailyHabit)
        .where(DailyHabit.user_id == user_id, DailyHabit.junk_food.is_(False))
    ) or 0
    achievement_xp = db.scalar(
        select(func.coalesce(func.sum(Achievement.xp_reward), 0))
        .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
        .where(UserAchievement.user_id == user_id)
    ) or 0
    return int(session_xp + (clean_habits * HABIT_CLEAN_XP) + achievement_xp)


def compute_streak(db: Session, user_id: int, today: date) -> tuple[int, int]:
    days = db.scalars(
        select(CalendarDay)
        .where(CalendarDay.user_id == user_id, CalendarDay.date <= today)
        .order_by(CalendarDay.date.asc())
    ).all()

    current = 0
    longest = 0
    running = 0
    for day in days:
        if day.day_type in {DayType.rest, DayType.holiday, DayType.vacation}:
            continue
        if day.status == DayStatus.completed:
            running += 1
            current = running
            longest = max(longest, running)
        elif day.status == DayStatus.partial:
            running = max(running, 1)
            current = running
            longest = max(longest, running)
        elif day.status == DayStatus.missed:
            running = 0
            current = 0
    return current, max(longest, current)


def compute_healthy_streak(db: Session, user_id: int, up_to: date) -> int:
    habits = db.scalars(
        select(DailyHabit)
        .where(DailyHabit.user_id == user_id, DailyHabit.date <= up_to)
        .order_by(DailyHabit.date.desc())
    ).all()
    habit_by_date = {habit.date: habit for habit in habits}
    streak = 0
    cursor = up_to
    while True:
        habit = habit_by_date.get(cursor)
        if habit is None or habit.junk_food:
            break
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def update_calendar_status_for_session(db: Session, session: WorkoutSession) -> CalendarDay:
    calendar_day = db.scalar(
        select(CalendarDay).where(CalendarDay.user_id == session.user_id, CalendarDay.date == session.workout_date)
    )
    if not calendar_day:
        calendar_day = CalendarDay(user_id=session.user_id, date=session.workout_date, day_type=DayType.workout)
    if session.status == WorkoutStatus.completed:
        calendar_day.status = DayStatus.completed
    elif session.status == WorkoutStatus.partial:
        calendar_day.status = DayStatus.partial
    elif session.status == WorkoutStatus.skipped:
        calendar_day.status = DayStatus.missed
    db.add(calendar_day)
    return calendar_day


def apply_habit_rewards(db: Session, stats: UserStats, habit: DailyHabit) -> None:
    if habit.junk_food:
        stats.healthy_streak = 0
    else:
        stats.healthy_streak += 1
        add_xp(db, stats, HABIT_CLEAN_XP)


def detect_personal_records(session: WorkoutSession) -> list[dict]:
    grouped: dict[int, dict] = defaultdict(lambda: {"best_weight": Decimal("0"), "best_reps": 0, "exercise_name": ""})
    for workout_set in session.workout_sets:
        if not workout_set.completed:
            continue
        current = grouped[workout_set.exercise_id]
        current["exercise_name"] = workout_set.exercise.name
        if workout_set.weight and workout_set.weight > current["best_weight"]:
            current["best_weight"] = workout_set.weight
        if workout_set.actual_reps and workout_set.actual_reps > current["best_reps"]:
            current["best_reps"] = workout_set.actual_reps
    return [{"exercise_id": key, **value} for key, value in grouped.items()]


def unlock_achievements(db: Session, user_id: int) -> list[str]:
    unlocked_now: list[str] = []
    stats = db.scalar(select(UserStats).where(UserStats.user_id == user_id))
    completed_workouts = db.scalar(
        select(func.count(WorkoutSession.id)).where(
            WorkoutSession.user_id == user_id, WorkoutSession.status == WorkoutStatus.completed
        )
    ) or 0
    clean_streak = stats.healthy_streak if stats else 0
    current_streak = stats.current_streak if stats else 0
    candidates = {
        "First Workout": completed_workouts >= 1,
        "7 Day Warrior": current_streak >= 7,
        "100 Workouts": completed_workouts >= 100,
        "Clean Week": clean_streak >= 7,
        "30 Day Beast": current_streak >= 30,
    }

    for name, should_unlock in candidates.items():
        if not should_unlock:
            continue
        achievement = db.scalar(select(Achievement).where(Achievement.name == name))
        if not achievement:
            continue
        existing = db.scalar(
            select(UserAchievement).where(
                UserAchievement.user_id == user_id, UserAchievement.achievement_id == achievement.id
            )
        )
        if existing:
            continue
        db.add(UserAchievement(user_id=user_id, achievement_id=achievement.id))
        if stats:
            add_xp(db, stats, achievement.xp_reward)
        unlocked_now.append(name)
    return unlocked_now


def ensure_calendar_for_month(db: Session, user_id: int, month_start: date) -> None:
    cursor = month_start
    month = month_start.month
    routines = db.scalars(select(WorkoutRoutine).where(WorkoutRoutine.user_id == user_id)).all()
    routine_days = {routine.day_of_week for routine in routines}
    existing_days = {
        item.date
        for item in db.scalars(
            select(CalendarDay).where(
                CalendarDay.user_id == user_id,
                CalendarDay.date >= month_start,
            )
        ).all()
    }
    while cursor.month == month:
        if cursor not in existing_days:
            day_type = DayType.workout if cursor.weekday() in routine_days else DayType.rest
            db.add(CalendarDay(user_id=user_id, date=cursor, day_type=day_type, status=DayStatus.none))
            existing_days.add(cursor)
        cursor += timedelta(days=1)
    db.commit()


def calculate_monthly_score(db: Session, user_id: int, month_key: str) -> MonthlyScore:
    year = int(month_key.split("-")[0])
    month = int(month_key.split("-")[1])
    month_start = date(year, month, 1)
    ensure_calendar_for_month(db, user_id, month_start)

    next_month = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    sessions = db.scalars(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == user_id, WorkoutSession.workout_date >= month_start, WorkoutSession.workout_date < next_month)
        .options(selectinload(WorkoutSession.workout_sets))
    ).all()
    days = db.scalars(
        select(CalendarDay).where(CalendarDay.user_id == user_id, CalendarDay.date >= month_start, CalendarDay.date < next_month)
    ).all()
    habits = db.scalars(
        select(DailyHabit).where(DailyHabit.user_id == user_id, DailyHabit.date >= month_start, DailyHabit.date < next_month)
    ).all()

    scheduled_days = [day for day in days if day.day_type == DayType.workout]
    completed_days = [day for day in scheduled_days if day.status == DayStatus.completed]
    partial_days = [day for day in scheduled_days if day.status == DayStatus.partial]
    clean_days = [habit for habit in habits if not habit.junk_food]

    consistency_ratio = (len(completed_days) + len(partial_days) * 0.5) / max(len(scheduled_days), 1)
    completion_ratio = sum(session.completion_percent for session in sessions) / max(len(sessions) * 100, 1)
    nutrition_ratio = len(clean_days) / max(len(habits), 1)

    pr_count = 0
    for session in sessions:
        for record in detect_personal_records(session):
            if record["best_weight"] or record["best_reps"]:
                pr_count += 1

    stats = db.scalar(select(UserStats).where(UserStats.user_id == user_id))
    streak_ratio = min((stats.longest_streak if stats else 0) / 10, 1)

    record = db.scalar(select(MonthlyScore).where(MonthlyScore.user_id == user_id, MonthlyScore.month == month_key))
    if not record:
        record = MonthlyScore(user_id=user_id, month=month_key)

    record.consistency_score = min(round(consistency_ratio * 40), 40)
    record.workout_score = min(round(completion_ratio * 25), 25)
    record.nutrition_score = min(round(nutrition_ratio * 20), 20)
    record.progress_score = min(pr_count * 2, 10)
    record.streak_score = min(round(streak_ratio * 5), 5)
    record.total_score = (
        record.consistency_score
        + record.workout_score
        + record.nutrition_score
        + record.progress_score
        + record.streak_score
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
