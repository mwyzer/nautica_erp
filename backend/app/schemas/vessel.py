from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class VesselBase(BaseModel):
    imo_number: str = Field(..., pattern=r"^IMO\d{7}$", description="7-digit IMO number e.g. IMO9876543")
    name: str = Field(..., min_length=2, max_length=100)
    vessel_type: str = Field(..., description="CONTAINER, BULK_CARRIER, TANKER, TUG_BOAT")
    dwt: float = Field(..., gt=0, description="Deadweight tonnage")
    flag_state: str = "Indonesia"
    status: str = "ACTIVE"
    current_port: str = "IDJKT"
    avg_speed_knots: float = Field(14.0, gt=0)
    fuel_burn_rate_mt_per_day: float = Field(22.0, gt=0)


class VesselCreate(VesselBase):
    pass


class VesselUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    current_port: Optional[str] = None
    avg_speed_knots: Optional[float] = None
    fuel_burn_rate_mt_per_day: Optional[float] = None


class VesselResponse(VesselBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
