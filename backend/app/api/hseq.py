from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/hseq", tags=["HSEQ, Safety & Port State Control"])

INCIDENTS_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "incident_number": "INC-2026-NAV-012",
        "vessel_name": "MV Nusantara Pioneer",
        "severity": "NEAR_MISS",
        "category": "NAVIGATION",
        "description": "Near-miss with fishing vessel not displaying navigation lights in Bangka Strait. Bridge team executed 20-deg starboard evasive maneuver.",
        "date_occurred": "2026-11-09",
        "corrective_action": "Extra lookout posted on monkey island during night passages in archipelago.",
        "status": "ACTION_TAKEN",
    },
    {
        "id": 2,
        "incident_number": "INC-2026-SAF-008",
        "vessel_name": "MV Barito Leader",
        "severity": "MINOR",
        "category": "OCCUPATIONAL_SAFETY",
        "description": "Crew member sustained minor finger abrasion during mooring rope tensioning on poop deck.",
        "date_occurred": "2026-11-06",
        "corrective_action": "Toolbox meeting conducted on snap-back hazard zones. Heavy-duty leather gloves replaced.",
        "status": "CLOSED",
    },
    {
        "id": 3,
        "incident_number": "INC-2026-ENV-003",
        "vessel_name": "MT Samudra Jaya",
        "severity": "SERIOUS",
        "category": "POLLUTION_PREVENTION",
        "description": "Minor hydraulic oil leak from steering gear pump tray into bilge saveall. Contained on board, zero sea release.",
        "date_occurred": "2026-11-08",
        "corrective_action": "Steering gear hydraulic ram actuator scheduled for shore overhaul before clearance.",
        "status": "INVESTIGATING",
    },
]

PSC_INSPECTIONS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "mou_regime": "TOKYO_MOU",
        "vessel_name": "MV Nusantara Pioneer",
        "target_port": "Singapore (SGSIN)",
        "inspection_date": "2026-11-13",
        "detention_risk_level": "LOW_RISK",
        "deficiencies_found": 0,
        "solas_ready": True,
        "marpol_ready": True,
        "stcw_ready": True,
        "mlc_2006_ready": True,
    },
    {
        "id": 2,
        "mou_regime": "DITJEN_HUBLA",
        "vessel_name": "MV Barito Leader",
        "target_port": "Tanjung Perak (IDSUB)",
        "inspection_date": "2026-11-11",
        "detention_risk_level": "HIGH_RISK",
        "deficiencies_found": 2,
        "solas_ready": True,
        "marpol_ready": True,
        "stcw_ready": False,  # Expired Master CoC
        "mlc_2006_ready": True,
    },
    {
        "id": 3,
        "mou_regime": "TOKYO_MOU",
        "vessel_name": "MT Samudra Jaya",
        "target_port": "Tanjung Priok (IDJKT)",
        "inspection_date": "2026-11-15",
        "detention_risk_level": "HIGH_RISK",
        "deficiencies_found": 1,
        "solas_ready": False,  # Steering gear defect
        "marpol_ready": True,
        "stcw_ready": True,
        "mlc_2006_ready": True,
    },
]


@router.get("/incidents", response_model=List[Dict[str, Any]])
async def list_safety_incidents():
    """Retrieve safety incident and near-miss registers."""
    return INCIDENTS_DATA


@router.get("/psc-checklists", response_model=List[Dict[str, Any]])
async def list_psc_checklists():
    """Retrieve Port State Control (PSC) pre-arrival readiness checklists."""
    return PSC_INSPECTIONS
