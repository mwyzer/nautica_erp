from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class CrewCertBase(BaseModel):
    cert_type: str = Field(..., description="STCW_COC, GMDSS, BST, MEDICAL_FITNESS")
    cert_number: str
    issue_date: date
    expiry_date: date
    is_valid: bool = True


class CrewCertCreate(CrewCertBase):
    crew_id: int


class CrewCertResponse(CrewCertBase):
    id: int
    crew_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CrewMemberBase(BaseModel):
    seafarer_id: str = Field(..., description="e.g. SID-2026-001")
    full_name: str
    rank: str = Field(..., description="MASTER, CHIEF_ENGINEER, FIRST_MATE, 2ND_ENGINEER, ABLE_SEAMAN")
    assigned_vessel_id: Optional[int] = None
    status: str = "ON_BOARD"


class CrewMemberCreate(CrewMemberBase):
    pass


class CrewMemberResponse(CrewMemberBase):
    id: int
    created_at: datetime
    certifications: List[CrewCertResponse] = []

    model_config = ConfigDict(from_attributes=True)
