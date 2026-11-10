from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MaintenanceTicketBase(BaseModel):
    vessel_id: int
    equipment_name: str
    severity: str = Field("MEDIUM", description="LOW, MEDIUM, HIGH, CRITICAL")
    description: str
    prevents_clearance: bool = False


class MaintenanceTicketCreate(MaintenanceTicketBase):
    pass


class MaintenanceTicketResponse(MaintenanceTicketBase):
    id: int
    status: str
    reported_at: datetime

    model_config = ConfigDict(from_attributes=True)
