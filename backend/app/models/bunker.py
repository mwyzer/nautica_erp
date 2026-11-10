from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class BunkerLog(Base):
    __tablename__ = "bunker_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    vessel_id: Mapped[int] = mapped_column(ForeignKey("vessels.id", ondelete="CASCADE"), nullable=False)
    voyage_id: Mapped[Optional[int]] = mapped_column(ForeignKey("voyages.id", ondelete="SET NULL"), nullable=True)
    fuel_type: Mapped[str] = mapped_column(String(30), default="VLSFO")  # VLSFO, MGO, LNG
    current_rob_mt: Mapped[float] = mapped_column(Float, nullable=False)  # Remaining On Board (MT)
    daily_consumption_mt: Mapped[float] = mapped_column(Float, default=0.0)
    speed_knots: Mapped[float] = mapped_column(Float, default=0.0)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    anomaly_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    vessel = relationship("Vessel", back_populates="bunker_logs")
    voyage = relationship("Voyage", back_populates="bunker_logs")
