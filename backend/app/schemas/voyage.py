from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.vessel import VesselResponse


class VoyageBase(BaseModel):
    voyage_number: str = Field(..., description="e.g. VOY-2026-JKT-SGSIN-01")
    vessel_id: int
    origin_port: str = Field(..., min_length=5, max_length=10, description="UN/LOCODE e.g. IDJKT")
    destination_port: str = Field(..., min_length=5, max_length=10, description="UN/LOCODE e.g. SGSIN")
    distance_nm: float = Field(..., gt=0, description="Nautical Miles")
    departure_time: datetime
    estimated_arrival: datetime
    cargo_type: str
    cargo_weight_mt: float = Field(..., ge=0)


class VoyageCreate(VoyageBase):
    pass


class VoyageUpdate(BaseModel):
    status: Optional[str] = None
    clearance_status: Optional[str] = None
    clearance_notes: Optional[str] = None


class VoyageResponse(VoyageBase):
    id: int
    status: str
    clearance_status: str
    clearance_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    vessel: Optional[VesselResponse] = None

    model_config = ConfigDict(from_attributes=True)
