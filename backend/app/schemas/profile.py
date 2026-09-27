"""Profile schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    age: int | None = Field(default=None, ge=10, le=120)
    height_cm: float | None = Field(default=None, ge=50, le=300)
    weight_kg: float | None = Field(default=None, ge=20, le=400)


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: EmailStr
    age: int | None
    height_cm: Decimal | None
    weight_kg: Decimal | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
