from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserStats
from app.schemas.auth import AuthResponse, UserCreate


def register_user(db: Session, payload: UserCreate) -> AuthResponse:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use.")

    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.flush()
    stats = UserStats(user_id=user.id)
    db.add(stats)
    db.commit()
    db.refresh(user)
    db.refresh(stats)
    return AuthResponse(access_token=create_access_token(str(user.id)), user=user, stats=stats)


def login_user(db: Session, email: str, password: str) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    stats = user.stats
    return AuthResponse(access_token=create_access_token(str(user.id)), user=user, stats=stats)
