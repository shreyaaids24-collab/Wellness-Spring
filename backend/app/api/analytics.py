"""Analytics and dashboard summary routes."""

from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.activity import DailyActivity
from app.models.goal import Goal
from app.models.user import User
from app.schemas.analytics import AnalyticsSummary, DayMetrics, ScoreBreakdown, StreakInfo, WeeklyAnalytics
from app.services.streaks import compute_streaks
from app.services.wellness import calculate_wellness_score, mood_to_value

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _f(value) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def _get_active_goal(db: Session, user_id: int) -> Goal | None:
    return (
        db.query(Goal)
        .filter(Goal.user_id == user_id, Goal.is_active.is_(True))
        .order_by(Goal.created_at.desc())
        .first()
    )


def _build_day_metrics(activities: list[DailyActivity], goal: Goal | None, start: date, end: date) -> list[DayMetrics]:
    by_date = {a.activity_date: a for a in activities}
    days: list[DayMetrics] = []
    cursor = start
    while cursor <= end:
        a = by_date.get(cursor)
        score = None
        if a and goal:
            score = int(calculate_wellness_score(a, goal)["total"])
        days.append(
            DayMetrics(
                date=cursor,
                steps=int(a.steps) if a else 0,
                exercise_minutes=int(a.exercise_minutes) if a else 0,
                water_litres=_f(a.water_litres) if a else 0.0,
                sleep_hours=_f(a.sleep_hours) if a else 0.0,
                screen_time_hours=_f(a.screen_time_hours) if a else 0.0,
                mood=a.mood if a else None,
                wellness_score=score,
            )
        )
        cursor += timedelta(days=1)
    return days


def _averages(days: list[DayMetrics]) -> dict[str, float]:
    n = max(len(days), 1)
    return {
        "steps": round(sum(d.steps for d in days) / n, 1),
        "exercise_minutes": round(sum(d.exercise_minutes for d in days) / n, 1),
        "water_litres": round(sum(d.water_litres for d in days) / n, 2),
        "sleep_hours": round(sum(d.sleep_hours for d in days) / n, 2),
        "screen_time_hours": round(sum(d.screen_time_hours for d in days) / n, 2),
        "wellness_score": round(
            sum(d.wellness_score or 0 for d in days) / n,
            1,
        ),
    }


@router.get("/weekly", response_model=WeeklyAnalytics)
def weekly_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    end = date.today()
    start = end - timedelta(days=6)
    goal = _get_active_goal(db, current_user.id)

    activities = (
        db.query(DailyActivity)
        .filter(
            DailyActivity.user_id == current_user.id,
            DailyActivity.activity_date >= start,
            DailyActivity.activity_date <= end,
        )
        .all()
    )
    # Streaks need a wider history
    history = (
        db.query(DailyActivity)
        .filter(DailyActivity.user_id == current_user.id)
        .order_by(DailyActivity.activity_date.asc())
        .all()
    )
    days = _build_day_metrics(activities, goal, start, end)
    streak = StreakInfo(**compute_streaks(history, goal, end))

    return WeeklyAnalytics(
        start_date=start,
        end_date=end,
        days=days,
        averages=_averages(days),
        streak=streak,
    )


@router.get("/monthly", response_model=AnalyticsSummary)
def monthly_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    end = date.today()
    start = end - timedelta(days=29)
    goal = _get_active_goal(db, current_user.id)

    activities = (
        db.query(DailyActivity)
        .filter(
            DailyActivity.user_id == current_user.id,
            DailyActivity.activity_date >= start,
            DailyActivity.activity_date <= end,
        )
        .all()
    )
    history = (
        db.query(DailyActivity)
        .filter(DailyActivity.user_id == current_user.id)
        .order_by(DailyActivity.activity_date.asc())
        .all()
    )
    days = _build_day_metrics(activities, goal, start, end)
    streak = StreakInfo(**compute_streaks(history, goal, end))

    totals = {
        "steps": float(sum(d.steps for d in days)),
        "exercise_minutes": float(sum(d.exercise_minutes for d in days)),
        "water_litres": round(sum(d.water_litres for d in days), 2),
        "sleep_hours": round(sum(d.sleep_hours for d in days), 2),
        "screen_time_hours": round(sum(d.screen_time_hours for d in days), 2),
        "entries_logged": float(sum(1 for d in days if d.mood is not None)),
    }

    return AnalyticsSummary(
        period="monthly",
        start_date=start,
        end_date=end,
        days=days,
        totals=totals,
        averages=_averages(days),
        streak=streak,
    )


@router.get("/today", response_model=dict)
def today_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dashboard helper: today's activity + score + streak + goal progress."""
    today = date.today()
    goal = _get_active_goal(db, current_user.id)
    activity = (
        db.query(DailyActivity)
        .filter(DailyActivity.user_id == current_user.id, DailyActivity.activity_date == today)
        .first()
    )
    history = (
        db.query(DailyActivity)
        .filter(DailyActivity.user_id == current_user.id)
        .order_by(DailyActivity.activity_date.asc())
        .all()
    )

    score = ScoreBreakdown(**calculate_wellness_score(activity, goal))
    streak = StreakInfo(**compute_streaks(history, goal, today))

    progress = None
    if goal:
        steps = int(activity.steps) if activity else 0
        exercise = int(activity.exercise_minutes) if activity else 0
        water = _f(activity.water_litres) if activity else 0.0
        sleep = _f(activity.sleep_hours) if activity else 0.0
        screen = _f(activity.screen_time_hours) if activity else 0.0

        def pct(current: float, target: float, inverse: bool = False) -> float:
            if target <= 0:
                return 0.0
            if inverse:
                # screen time: 100% when at or below goal
                return round(min(100.0, (target / max(current, 0.01)) * 100) if current > target else 100.0, 1)
            return round(min(100.0, (current / target) * 100), 1)

        progress = {
            "steps": {"current": steps, "goal": goal.steps_goal, "percent": pct(steps, goal.steps_goal)},
            "exercise": {
                "current": exercise,
                "goal": goal.exercise_minutes_goal,
                "percent": pct(exercise, goal.exercise_minutes_goal),
            },
            "water": {
                "current": water,
                "goal": _f(goal.water_litres_goal),
                "percent": pct(water, _f(goal.water_litres_goal)),
            },
            "sleep": {
                "current": sleep,
                "goal": _f(goal.sleep_hours_goal),
                "percent": pct(sleep, _f(goal.sleep_hours_goal)),
            },
            "screen_time": {
                "current": screen,
                "goal": _f(goal.screen_time_hours_goal),
                "percent": pct(screen, _f(goal.screen_time_hours_goal), inverse=True),
            },
        }

    return {
        "date": today.isoformat(),
        "activity": ActivityOut.from_orm_safe(activity),
        "score": score.model_dump(),
        "streak": streak.model_dump(),
        "progress": progress,
        "goal": {
            "steps_goal": goal.steps_goal,
            "exercise_minutes_goal": goal.exercise_minutes_goal,
            "water_litres_goal": _f(goal.water_litres_goal),
            "sleep_hours_goal": _f(goal.sleep_hours_goal),
            "screen_time_hours_goal": _f(goal.screen_time_hours_goal),
        }
        if goal
        else None,
        "mood_value": mood_to_value(activity.mood if activity else None),
    }


class ActivityOut:
    """Small helper to serialise today's activity without a circular import."""

    @staticmethod
    def from_orm_safe(activity: DailyActivity | None) -> dict | None:
        if not activity:
            return None
        return {
            "id": activity.id,
            "activity_date": activity.activity_date.isoformat(),
            "steps": activity.steps,
            "exercise_minutes": activity.exercise_minutes,
            "water_litres": _f(activity.water_litres),
            "sleep_hours": _f(activity.sleep_hours),
            "screen_time_hours": _f(activity.screen_time_hours),
            "mood": activity.mood,
            "notes": activity.notes,
        }
