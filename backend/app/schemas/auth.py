from pydantic import BaseModel, EmailStr

from app.schemas.common import ORMModel


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(ORMModel):
    id: int
    name: str
    email: EmailStr


class UserStatsRead(ORMModel):
    total_xp: int
    level: int
    current_streak: int
    longest_streak: int
    healthy_streak: int


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
    stats: UserStatsRead
