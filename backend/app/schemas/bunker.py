from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class BunkerLogBase(BaseModel):
    vessel_id: int
    voyage_id: Optional[int] = None
    fuel_type: str = "VLSFO"
    current_rob_mt: float = Field(..., ge=0, description="Remaining On Board (Metric Tons)")
    daily_consumption_mt: float = Field(0.0, ge=0)
    speed_knots: float = Field(0.0, ge=0)


class BunkerLogCreate(BunkerLogBase):
    pass


class BunkerLogResponse(BunkerLogBase):
    id: int
    recorded_at: datetime
    anomaly_flag: bool
    anomaly_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
