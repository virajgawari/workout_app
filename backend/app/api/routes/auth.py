from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, UserCreate, UserLogin, UserRead, UserStatsRead
from app.services.auth import login_user, register_user


router = APIRouter()


@router.post("/register", response_model=AuthResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, payload)


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, payload.email, payload.password)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"user": UserRead.model_validate(current_user), "stats": UserStatsRead.model_validate(current_user.stats)}
