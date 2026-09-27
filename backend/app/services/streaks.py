"""Habit streak calculations from activity history."""

from datetime import date, timedelta
from typing import Any

from app.services.wellness import activity_meets_goals


def compute_streaks(activities: list[Any], goal: Any, today: date | None = None) -> dict:
    """
    Compute current streak, longest streak, and weekly completion %.

    activities: list of DailyActivity ORM objects (any order)
    """
    today = today or date.today()
    if not goal:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "weekly_completion_percent": 0.0,
        }

    success_dates = {
        a.activity_date
        for a in activities
        if activity_meets_goals(a, goal)
    }

    # Current streak: walk backwards from today (or yesterday if today not logged yet)
    current = 0
    cursor = today if today in success_dates else today - timedelta(days=1)
    while cursor in success_dates:
        current += 1
        cursor -= timedelta(days=1)

    # Longest streak across all success dates
    longest = 0
    if success_dates:
        ordered = sorted(success_dates)
        run = 1
        longest = 1
        for i in range(1, len(ordered)):
            if ordered[i] == ordered[i - 1] + timedelta(days=1):
                run += 1
                longest = max(longest, run)
            else:
                run = 1

    # Weekly completion: last 7 days including today
    week_start = today - timedelta(days=6)
    met = sum(1 for i in range(7) if (week_start + timedelta(days=i)) in success_dates)
    weekly_pct = round((met / 7) * 100, 1)

    return {
        "current_streak": current,
        "longest_streak": longest,
        "weekly_completion_percent": weekly_pct,
    }
