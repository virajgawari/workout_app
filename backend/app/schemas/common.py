from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, use_enum_values=True)


class MessageResponse(BaseModel):
    message: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SelectOption(BaseModel):
    label: str
    value: str


Number = int | float | Decimal
DateLike = date | datetime
