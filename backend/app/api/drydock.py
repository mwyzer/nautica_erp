from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/drydock", tags=["Drydocking & Shipyard Management"])

DRYDOCK_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "project_code": "DD-2026-SJ-05",
        "vessel_name": "MT Samudra Jaya",
        "survey_type": "SPECIAL_SURVEY_5YR",
        "classification_society": "DNV & Biro Klasifikasi Indonesia (BKI)",
        "planned_start": "2026-12-01",
        "planned_duration_days": 21,
        "budget_estimate_usd": 680000.0,
        "actual_spent_usd": 45000.0,
        "selected_shipyard": "PT PAL Indonesia (Surabaya)",
        "status": "PLANNING_SPECS",
        "key_jobs": [
            "Hull high-pressure washing (HPW 2500 bar) & silicone foul-release paint coating",
            "Tailshaft clearance check & Stern tube seal renewal (Kongsberg Simplex)",
            "Overhaul of rudder pintle, gudgeons, and steering gear hydraulic actuator rams",
            "Cargo tank ultrasonic thickness measurement (UTM gauging) across frames 45-88",
            "Main boiler internal inspection and safety valve hydrotest (40 bar)",
        ],
    },
    {
        "id": 2,
        "project_code": "DD-2025-NP-03",
        "vessel_name": "MV Nusantara Pioneer",
        "survey_type": "INTERMEDIATE_SURVEY",
        "classification_society": "Biro Klasifikasi Indonesia (BKI)",
        "planned_start": "2025-06-10",
        "planned_duration_days": 14,
        "budget_estimate_usd": 320000.0,
        "actual_spent_usd": 314500.0,
        "selected_shipyard": "Keppel FELS Shipyard Singapore",
        "status": "COMPLETED_DELIVERED",
        "key_jobs": [
            "Sea chest overhaul and cathodic protection zinc anode renewal",
            "Bow thruster propeller hub inspection and dynamic sealing replacement",
            "Emergency fire pump and bilge isolation valves class survey",
        ],
    },
    {
        "id": 3,
        "project_code": "DD-2027-BL-01",
        "vessel_name": "MV Barito Leader",
        "survey_type": "SPECIAL_SURVEY_5YR",
        "classification_society": "Lloyd's Register (LR)",
        "planned_start": "2027-03-15",
        "planned_duration_days": 25,
        "budget_estimate_usd": 850000.0,
        "actual_spent_usd": 0.0,
        "selected_shipyard": "Tender in progress (PT DKB Jakarta vs PaxOcean Batam)",
        "status": "TENDERING",
        "key_jobs": [
            "Complete cargo hold steel renewal (~45 tons tensile marine grade steel)",
            "Hatch cover hydraulic cylinders overhaul and MacGregor rubber gasket renewal",
            "Main engine crankshaft deflection measurement & turbocharger balancing",
        ],
    },
]


@router.get("/projects", response_model=List[Dict[str, Any]])
async def list_drydock_projects():
    """Retrieve major drydocking projects, special surveys, and shipyard tenders."""
    return DRYDOCK_PROJECTS
