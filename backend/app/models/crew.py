from datetime import datetime, date, timezone
from typing import List, Optional
from sqlalchemy import String, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class CrewMember(Base):
    __tablename__ = "crew_members"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    seafarer_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    rank: Mapped[str] = mapped_column(String(50), nullable=False)  # MASTER, CHIEF_ENGINEER, FIRST_MATE, 2ND_ENGINEER, ABLE_SEAMAN
    assigned_vessel_id: Mapped[Optional[int]] = mapped_column(ForeignKey("vessels.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ON_BOARD")  # ON_BOARD, ON_SHORE, ON_LEAVE
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    assigned_vessel = relationship("Vessel", back_populates="crew_members")
    certifications: Mapped[List["CrewCertification"]] = relationship(
        "CrewCertification", back_populates="crew_member", cascade="all, delete-orphan", lazy="selectin"
    )


class CrewCertification(Base):
    __tablename__ = "crew_certifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    crew_id: Mapped[int] = mapped_column(ForeignKey("crew_members.id", ondelete="CASCADE"), nullable=False)
    cert_type: Mapped[str] = mapped_column(String(100), nullable=False)  # STCW_COC, GMDSS, BST, MEDICAL_FITNESS
    cert_number: Mapped[str] = mapped_column(String(100), nullable=False)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    crew_member = relationship("CrewMember", back_populates="certifications")
