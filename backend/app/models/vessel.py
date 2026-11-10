from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Vessel(Base):
    __tablename__ = "vessels"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    imo_number: Mapped[str] = mapped_column(String(10), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    vessel_type: Mapped[str] = mapped_column(String(50), nullable=False)  # CONTAINER, BULK_CARRIER, TANKER
    dwt: Mapped[float] = mapped_column(Float, nullable=False)  # Deadweight Tonnage
    flag_state: Mapped[str] = mapped_column(String(50), default="Indonesia")
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")  # ACTIVE, IN_TRANSIT, MOORED, IN_MAINTENANCE
    current_port: Mapped[str] = mapped_column(String(50), default="IDJKT")
    avg_speed_knots: Mapped[float] = mapped_column(Float, default=14.0)
    fuel_burn_rate_mt_per_day: Mapped[float] = mapped_column(Float, default=22.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    voyages = relationship("Voyage", back_populates="vessel", cascade="all, delete-orphan")
    crew_members = relationship("CrewMember", back_populates="assigned_vessel")
    bunker_logs = relationship("BunkerLog", back_populates="vessel", cascade="all, delete-orphan")
    maintenance_tickets = relationship("MaintenanceTicket", back_populates="vessel", cascade="all, delete-orphan")
