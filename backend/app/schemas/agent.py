from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ClearanceAuditResult(BaseModel):
    voyage_id: int
    voyage_number: str
    vessel_name: str
    decision: str = Field(..., description="APPROVED, REJECTED, CONDITIONAL")
    fuel_check: Dict[str, Any]
    crew_compliance: Dict[str, Any]
    maintenance_status: Dict[str, Any]
    ai_summary: str
    recommended_actions: List[str]
    audited_at: datetime


class AgentChatRequest(BaseModel):
    message: str = Field(..., min_length=2, description="Natural language query for maritime superintendent")


class AgentChatResponse(BaseModel):
    query: str
    reply: str
    tool_executed: Optional[str] = None
    data: Optional[Any] = None
