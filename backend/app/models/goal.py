"""Daily wellness goals – one active goal set per user (or historical rows)."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    steps_goal: Mapped[int] = mapped_column(Integer, default=8000, nullable=False)
    exercise_minutes_goal: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    water_litres_goal: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=2.0, nullable=False)
    sleep_hours_goal: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=8.0, nullable=False)
    screen_time_hours_goal: Mapped[Decimal] = mapped_column(
        Numeric(4, 2), default=6.0, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="goals")  # noqa: F821
