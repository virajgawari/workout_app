from pydantic import BaseModel


class ProgressResponse(BaseModel):
    workout_frequency: list[dict]
    workout_volume: list[dict]
    strength_progression: list[dict]
    junk_food_frequency: list[dict]
    monthly_scores: list[dict]
