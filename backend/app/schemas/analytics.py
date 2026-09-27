"""Analytics response schemas."""

from datetime import date

from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    steps: int = Field(description="Points from steps (max 20)")
    exercise: int = Field(description="Points from exercise (max 20)")
    water: int = Field(description="Points from water (max 20)")
    sleep: int = Field(description="Points from sleep (max 20)")
    screen_time: int = Field(description="Points from screen time (max 20)")
    total: int = Field(description="Daily wellness score out of 100")
    note: str = "This score is for personal tracking only, not a medical assessment."


class StreakInfo(BaseModel):
    current_streak: int
    longest_streak: int
    weekly_completion_percent: float


class MoodPoint(BaseModel):
    date: date
    mood: str
    mood_value: int


class DayMetrics(BaseModel):
    date: date
    steps: int
    exercise_minutes: int
    water_litres: float
    sleep_hours: float
    screen_time_hours: float
    mood: str | None
    wellness_score: int | None


class WeeklyAnalytics(BaseModel):
    start_date: date
    end_date: date
    days: list[DayMetrics]
    averages: dict[str, float]
    streak: StreakInfo


class AnalyticsSummary(BaseModel):
    period: str
    start_date: date
    end_date: date
    days: list[DayMetrics]
    totals: dict[str, float]
    averages: dict[str, float]
    streak: StreakInfo
