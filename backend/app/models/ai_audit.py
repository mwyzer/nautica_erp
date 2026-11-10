from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class AIClearanceAudit(Base):
    __tablename__ = "ai_clearance_audits"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    voyage_id: Mapped[int] = mapped_column(ForeignKey("voyages.id", ondelete="CASCADE"), nullable=False)
    decision: Mapped[str] = mapped_column(String(30), nullable=False)  # APPROVED, REJECTED, CONDITIONAL
    fuel_sufficiency_score: Mapped[float] = mapped_column(Float, nullable=False)  # e.g. 1.25 (125% of required)
    crew_compliance_status: Mapped[str] = mapped_column(String(50), nullable=False)
    maintenance_risk_status: Mapped[str] = mapped_column(String(50), nullable=False)
    ai_summary: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_actions: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    audited_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    # Relationships
    voyage = relationship("Voyage", back_populates="ai_audits")
