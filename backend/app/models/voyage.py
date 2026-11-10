from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Voyage(Base):
    __tablename__ = "voyages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    voyage_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    vessel_id: Mapped[int] = mapped_column(ForeignKey("vessels.id", ondelete="RESTRICT"), nullable=False)
    origin_port: Mapped[str] = mapped_column(String(10), nullable=False)  # UN/LOCODE e.g. IDJKT
    destination_port: Mapped[str] = mapped_column(String(10), nullable=False)  # UN/LOCODE e.g. SGSIN
    distance_nm: Mapped[float] = mapped_column(Float, nullable=False)
    departure_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    estimated_arrival: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cargo_type: Mapped[str] = mapped_column(String(100), nullable=False)
    cargo_weight_mt: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="PLANNED")  # PLANNED, CLEARED, IN_PROGRESS, COMPLETED, CANCELLED
    clearance_status: Mapped[str] = mapped_column(String(30), default="PENDING")  # PENDING, APPROVED, REJECTED
    clearance_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    vessel = relationship("Vessel", back_populates="voyages", lazy="selectin")
    bunker_logs = relationship("BunkerLog", back_populates="voyage")
    ai_audits: Mapped[List["AIClearanceAudit"]] = relationship(
        "AIClearanceAudit", back_populates="voyage", cascade="all, delete-orphan", lazy="selectin"
    )
