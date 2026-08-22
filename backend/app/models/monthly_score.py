from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MonthlyScore(Base):
    __tablename__ = "monthly_scores"
    __table_args__ = (UniqueConstraint("user_id", "month", name="uq_monthly_score_user_month"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    month: Mapped[str] = mapped_column(String(7), nullable=False)
    workout_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    consistency_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    nutrition_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    progress_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship(back_populates="monthly_scores")


from app.models.user import User
