from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class PersonalRecordItem(BaseModel):
    exercise_name: str
    best_weight: Decimal | None
    best_reps: int | None
    estimated_one_rm: Decimal | None
    achieved_on: date | None


class RecentSessionItem(BaseModel):
    id: int
    workout_date: date
    routine_name: str | None
    status: str
    total_xp: int
    completion_percent: int


class DashboardResponse(BaseModel):
    today_summary: dict
    stats: dict
    monthly_score: dict
    personal_records: list[PersonalRecordItem]
    recent_sessions: list[RecentSessionItem]
    calendar: list[dict]
    progress_series: dict
