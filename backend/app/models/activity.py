"""Daily wellness activity entry – one row per user per date."""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class DailyActivity(Base):
    __tablename__ = "daily_activities"
    __table_args__ = (
        UniqueConstraint("user_id", "activity_date", name="uq_user_activity_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    activity_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    steps: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    exercise_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    water_litres: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=0, nullable=False)
    sleep_hours: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=0, nullable=False)
    screen_time_hours: Mapped[Decimal] = mapped_column(Numeric(4, 2), default=0, nullable=False)
    mood: Mapped[str] = mapped_column(String(20), default="neutral", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="activities")  # noqa: F821
