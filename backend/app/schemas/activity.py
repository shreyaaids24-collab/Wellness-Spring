"""Daily activity schemas with wellness field validation."""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

VALID_MOODS = {"great", "good", "neutral", "low", "poor"}


class ActivityBase(BaseModel):
    activity_date: date
    steps: int = Field(default=0, ge=0, le=100_000)
    exercise_minutes: int = Field(default=0, ge=0, le=1440)
    water_litres: float = Field(default=0, ge=0, le=20)
    sleep_hours: float = Field(default=0, ge=0, le=24)
    screen_time_hours: float = Field(default=0, ge=0, le=24)
    mood: str = Field(default="neutral")
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("mood")
    @classmethod
    def validate_mood(cls, value: str) -> str:
        normalised = value.strip().lower()
        if normalised not in VALID_MOODS:
            raise ValueError(f"Mood must be one of: {', '.join(sorted(VALID_MOODS))}")
        return normalised

    @field_validator("activity_date")
    @classmethod
    def date_not_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Activity date cannot be in the future")
        return value


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    steps: int | None = Field(default=None, ge=0, le=100_000)
    exercise_minutes: int | None = Field(default=None, ge=0, le=1440)
    water_litres: float | None = Field(default=None, ge=0, le=20)
    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    screen_time_hours: float | None = Field(default=None, ge=0, le=24)
    mood: str | None = None
    notes: str | None = Field(default=None, max_length=1000)

    @field_validator("mood")
    @classmethod
    def validate_mood(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalised = value.strip().lower()
        if normalised not in VALID_MOODS:
            raise ValueError(f"Mood must be one of: {', '.join(sorted(VALID_MOODS))}")
        return normalised


class ActivityResponse(BaseModel):
    id: int
    user_id: int
    activity_date: date
    steps: int
    exercise_minutes: int
    water_litres: Decimal
    sleep_hours: Decimal
    screen_time_hours: Decimal
    mood: str
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
