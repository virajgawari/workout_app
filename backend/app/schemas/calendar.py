from datetime import date

from pydantic import BaseModel

from app.schemas.common import ORMModel


class CalendarDayUpdate(BaseModel):
    date: date
    day_type: str


class CalendarDayRead(ORMModel):
    id: int
    date: date
    day_type: str
    status: str
