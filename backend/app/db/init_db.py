from sqlalchemy import select

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.exercise import Exercise
from app.services.gamification import seed_achievements

DEFAULT_EXERCISES = [
    ("Bench Press", "Chest", "Barbell flat bench press targeting pectoral muscles."),
    ("Incline Dumbbell Press", "Chest", "Upper chest incline dumbbell pressing movement."),
    ("Push-Up", "Chest", "Bodyweight pushing exercise for chest and triceps."),
    ("Barbell Squat", "Legs", "Back squat targeting quadriceps, glutes, and core."),
    ("Romanian Deadlift", "Legs", "Hinge movement targeting hamstrings and glutes."),
    ("Leg Press", "Legs", "Machine compound movement for lower body development."),
    ("Deadlift", "Back", "Conventional barbell deadlift for full posterior chain strength."),
    ("Pull-Up", "Back", "Bodyweight vertical pull targeting latissimus dorsi."),
    ("Barbell Row", "Back", "Bent-over barbell row for back thickness and strength."),
    ("Lat Pulldown", "Back", "Cable vertical pull targeting back width."),
    ("Overhead Press", "Shoulders", "Standing barbell shoulder press for deltoid strength."),
    ("Lateral Raise", "Shoulders", "Dumbbell side raises targeting lateral deltoids."),
    ("Bicep Curl", "Arms", "Barbell or dumbbell curl for biceps hypertrophy."),
    ("Tricep Pushdown", "Arms", "Cable pushdown targeting the triceps muscles."),
    ("Hanging Leg Raise", "Core", "Hanging core exercise targeting abdominals and hip flexors."),
    ("Plank", "Core", "Isometric core stabilization exercise."),
]


def seed_exercises(db) -> None:
    for name, muscle_group, description in DEFAULT_EXERCISES:
        if not db.scalar(select(Exercise).where(Exercise.name == name)):
            db.add(Exercise(name=name, muscle_group=muscle_group, description=description))
    db.commit()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_achievements(db)
        seed_exercises(db)
    finally:
        db.close()

