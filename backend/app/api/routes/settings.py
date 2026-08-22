from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User


router = APIRouter()


@router.get("/")
def get_settings(current_user: User = Depends(get_current_user), _: Session = Depends(get_db)):
    return {
        "profile": {"name": current_user.name, "email": current_user.email},
        "xp_rules": {
            "complete_workout": 100,
            "complete_all_sets": 50,
            "no_junk_food": 25,
            "new_pr": 75,
            "streak_bonus": 150,
        },
    }
