"""Transparent daily wellness score (0–100). Not a medical diagnosis."""

from decimal import Decimal
from typing import Any

MOOD_VALUES = {"great": 5, "good": 4, "neutral": 3, "low": 2, "poor": 1}


def _to_float(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def calculate_wellness_score(activity: Any, goal: Any) -> dict[str, int | str]:
    """
    Score each category out of 20 against the user's goals.

    - Steps / exercise / water / sleep: progress toward goal (capped at 20)
    - Screen time: lower is better; full points when at or below the goal
    """
    if activity is None or goal is None:
        return {
            "steps": 0,
            "exercise": 0,
            "water": 0,
            "sleep": 0,
            "screen_time": 0,
            "total": 0,
            "note": "This score is for personal tracking only, not a medical assessment.",
        }

    steps = int(activity.steps or 0)
    exercise = int(activity.exercise_minutes or 0)
    water = _to_float(activity.water_litres)
    sleep = _to_float(activity.sleep_hours)
    screen = _to_float(activity.screen_time_hours)

    steps_goal = max(int(goal.steps_goal or 1), 1)
    exercise_goal = max(int(goal.exercise_minutes_goal or 1), 1)
    water_goal = max(_to_float(goal.water_litres_goal), 0.1)
    sleep_goal = max(_to_float(goal.sleep_hours_goal), 0.1)
    screen_goal = max(_to_float(goal.screen_time_hours_goal), 0.1)

    steps_pts = min(20, int(round((steps / steps_goal) * 20)))
    exercise_pts = min(20, int(round((exercise / exercise_goal) * 20)))
    water_pts = min(20, int(round((water / water_goal) * 20)))

    # Sleep: score peaks at the goal; slight penalty for large oversleep
    sleep_ratio = sleep / sleep_goal
    if sleep_ratio <= 1:
        sleep_pts = int(round(sleep_ratio * 20))
    else:
        overshoot = sleep_ratio - 1
        sleep_pts = max(10, int(round(20 - overshoot * 10)))

    # Screen time: full points at or below goal
    if screen <= screen_goal:
        screen_pts = 20
    else:
        excess_ratio = (screen - screen_goal) / screen_goal
        screen_pts = max(0, int(round(20 - excess_ratio * 20)))

    total = steps_pts + exercise_pts + water_pts + sleep_pts + screen_pts

    return {
        "steps": steps_pts,
        "exercise": exercise_pts,
        "water": water_pts,
        "sleep": sleep_pts,
        "screen_time": screen_pts,
        "total": total,
        "note": "This score is for personal tracking only, not a medical assessment.",
    }


def mood_to_value(mood: str | None) -> int:
    if not mood:
        return 0
    return MOOD_VALUES.get(mood.lower(), 0)


def activity_meets_goals(activity: Any, goal: Any) -> bool:
    """A day counts toward a streak when most goals are met (4 of 5)."""
    if activity is None or goal is None:
        return False

    checks = [
        int(activity.steps or 0) >= int(goal.steps_goal),
        int(activity.exercise_minutes or 0) >= int(goal.exercise_minutes_goal),
        _to_float(activity.water_litres) >= _to_float(goal.water_litres_goal),
        _to_float(activity.sleep_hours) >= _to_float(goal.sleep_hours_goal),
        _to_float(activity.screen_time_hours) <= _to_float(goal.screen_time_hours_goal),
    ]
    return sum(checks) >= 4
