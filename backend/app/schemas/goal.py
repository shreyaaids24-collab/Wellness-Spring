"""Goal schemas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class GoalCreate(BaseModel):
    steps_goal: int = Field(default=8000, ge=1000, le=100_000)
    exercise_minutes_goal: int = Field(default=30, ge=5, le=300)
    water_litres_goal: float = Field(default=2.0, ge=0.5, le=10)
    sleep_hours_goal: float = Field(default=8.0, ge=4, le=14)
    screen_time_hours_goal: float = Field(default=6.0, ge=1, le=16)


class GoalUpdate(BaseModel):
    steps_goal: int | None = Field(default=None, ge=1000, le=100_000)
    exercise_minutes_goal: int | None = Field(default=None, ge=5, le=300)
    water_litres_goal: float | None = Field(default=None, ge=0.5, le=10)
    sleep_hours_goal: float | None = Field(default=None, ge=4, le=14)
    screen_time_hours_goal: float | None = Field(default=None, ge=1, le=16)
    is_active: bool | None = None


class GoalResponse(BaseModel):
    id: int
    user_id: int
    steps_goal: int
    exercise_minutes_goal: int
    water_litres_goal: Decimal
    sleep_hours_goal: Decimal
    screen_time_hours_goal: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
