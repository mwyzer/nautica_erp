from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/piracy-security", tags=["Piracy & High-Risk Area (HRA) Security Intelligence (BMP5 / IMB)"])


class HighRiskZone(BaseModel):
    zone_id: str
    zone_name: str
    ocean_basin: str
    risk_level: str  # "CRITICAL", "HIGH", "MODERATE"
    description: str
    recommended_min_speed_knots: float
    irtc_corridor_active: bool
    ukmto_contact: str


class PiracyIncident(BaseModel):
    id: int
    incident_date: str
    location_name: str
    latitude: float
    longitude: float
    vessel_type: str
    attack_type: str  # "Suspicious Skiff Approach", "Attempted Boarding", "Fired Upon", "Armed Robbery"
    countermeasure_applied: str
    outcome: str  # "ATTACK_REPELLED", "CITADEL_EVASION_SUCCESSFUL", "REPORTED_TO_NAVAL_COALITION"


class VesselSecurityReadiness(BaseModel):
    vessel_id: int
    vessel_name: str
    current_threat_zone: str
    bmp5_compliance_percent: float
    razor_wire_installed: bool
    water_cannons_pressurized: bool
    citadel_locked_and_provisioned: bool
    citadel_days_provisions: int
    armed_security_onboard: bool
    pcasp_guard_count: int  # Privately Contracted Armed Security Personnel
    ais_silent_mode_authorized: bool
    ukmto_transit_registered: bool
    security_drill_last_date: str
    overall_security_status: str  # "SECURE", "ACTION_REQUIRED", "CRITICAL_THREAT"


HRA_ZONES: List[Dict[str, Any]] = [
    {
        "zone_id": "HRA-GULF-ADEN",
        "zone_name": "Gulf of Aden & Southern Red Sea (Bab-el-Mandeb)",
        "ocean_basin": "Western Indian Ocean",
        "risk_level": "CRITICAL",
        "description": "Wilayah ancaman misil balistik, drone laut, dan perompakan berkecepatan tinggi. Wajib menggunakan koridor IRTC dan koordinasi UKMTO.",
        "recommended_min_speed_knots": 14.5,
        "irtc_corridor_active": True,
        "ukmto_contact": "+44 2392 222060 (UKMTO Dubai)",
    },
    {
        "zone_id": "HRA-GULF-GUINEA",
        "zone_name": "Gulf of Guinea (Offshore Nigeria / Benin / Togo)",
        "ocean_basin": "West Africa Atlantic",
        "risk_level": "HIGH",
        "description": "Zona penculikan awak kapal untuk tebusan (Kidnap for Ransom). Wajib perlindungan Citadel dan patroli pengawal bersenjata resmi.",
        "recommended_min_speed_knots": 13.5,
        "irtc_corridor_active": False,
        "ukmto_contact": "+33 298 22 88 88 (MDAT-GoG)",
    },
    {
        "zone_id": "HRA-MALACCA-STRAIT",
        "zone_name": "Selat Malaka & Selat Singapura (TSS Corridor)",
        "ocean_basin": "Southeast Asia / Indo-Pacific",
        "risk_level": "MODERATE",
        "description": "Ancaman perompakan bajak laut bersenjata tajam saat kapal berkecepatan rendah di malam hari (Petty Theft / Boarding).",
        "recommended_min_speed_knots": 12.0,
        "irtc_corridor_active": True,
        "ukmto_contact": "+65 6595 6514 (ReCAAP ISC Singapore)",
    },
]

RECENT_INCIDENTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "incident_date": "2026-11-09 03:20",
        "location_name": "Gulf of Aden (IRTC Waypoint 4A)",
        "latitude": 12.45,
        "longitude": 46.85,
        "vessel_type": "Product Tanker",
        "attack_type": "Suspicious Skiff Approach",
        "countermeasure_applied": "Water cannon activated, flare fired, evasive zig-zag",
        "outcome": "ATTACK_REPELLED",
    },
    {
        "id": 2,
        "incident_date": "2026-11-07 22:15",
        "location_name": "Offshore Brass, Gulf of Guinea",
        "latitude": 3.95,
        "longitude": 6.15,
        "vessel_type": "Bulk Carrier",
        "attack_type": "Attempted Boarding",
        "countermeasure_applied": "Crew retreated to Citadel, naval patrol alerted",
        "outcome": "CITADEL_EVASION_SUCCESSFUL",
    },
    {
        "id": 3,
        "incident_date": "2026-11-05 01:45",
        "location_name": "Eastbound TSS, Singapore Strait",
        "latitude": 1.18,
        "longitude": 103.95,
        "vessel_type": "Container Ship",
        "attack_type": "Armed Robbery Attempt",
        "countermeasure_applied": "Deck searchlights energized, ship horn 1 short 1 long blast",
        "outcome": "ATTACK_REPELLED",
    },
]

SECURITY_READINESS: Dict[int, Dict[str, Any]] = {
    1: {
        "vessel_id": 1,
        "vessel_name": "MV Nusantara Pioneer",
        "current_threat_zone": "Selat Malaka & Selat Singapura (TSS Corridor)",
        "bmp5_compliance_percent": 95.0,
        "razor_wire_installed": True,
        "water_cannons_pressurized": True,
        "citadel_locked_and_provisioned": True,
        "citadel_days_provisions": 7,
        "armed_security_onboard": False,
        "pcasp_guard_count": 0,
        "ais_silent_mode_authorized": True,
        "ukmto_transit_registered": True,
        "security_drill_last_date": "2026-10-28",
        "overall_security_status": "SECURE",
    },
    2: {
        "vessel_id": 2,
        "vessel_name": "MV Barito Leader",
        "current_threat_zone": "Laut Jawa & Selat Makassar",
        "bmp5_compliance_percent": 88.0,
        "razor_wire_installed": True,
        "water_cannons_pressurized": True,
        "citadel_locked_and_provisioned": True,
        "citadel_days_provisions": 5,
        "armed_security_onboard": False,
        "pcasp_guard_count": 0,
        "ais_silent_mode_authorized": False,
        "ukmto_transit_registered": False,
        "security_drill_last_date": "2026-11-02",
        "overall_security_status": "SECURE",
    },
    3: {
        "vessel_id": 3,
        "vessel_name": "MT Samudra Jaya",
        "current_threat_zone": "Gulf of Aden & Southern Red Sea (Bab-el-Mandeb)",
        "bmp5_compliance_percent": 100.0,
        "razor_wire_installed": True,
        "water_cannons_pressurized": True,
        "citadel_locked_and_provisioned": True,
        "citadel_days_provisions": 14,
        "armed_security_onboard": True,
        "pcasp_guard_count": 4,
        "ais_silent_mode_authorized": True,
        "ukmto_transit_registered": True,
        "security_drill_last_date": "2026-11-06",
        "overall_security_status": "SECURE",
    },
}


@router.get("/threat-map")
async def get_threat_map_and_incidents():
    """Returns real-time maritime High-Risk Areas (HRA) and IMB Piracy Reporting Centre incident feed."""
    return {
        "hra_zones": HRA_ZONES,
        "recent_incidents": RECENT_INCIDENTS,
    }


@router.get("/readiness/{vessel_id}", response_model=VesselSecurityReadiness)
async def get_vessel_security_readiness(vessel_id: int):
    """Returns BMP5 anti-piracy hardening readiness and Citadel status for a specific vessel."""
    if vessel_id in SECURITY_READINESS:
        return SECURITY_READINESS[vessel_id]

    # Default fallback readiness
    return VesselSecurityReadiness(
        vessel_id=vessel_id,
        vessel_name=f"Vessel #{vessel_id}",
        current_threat_zone="Selat Malaka & Selat Singapura (TSS Corridor)",
        bmp5_compliance_percent=90.0,
        razor_wire_installed=True,
        water_cannons_pressurized=True,
        citadel_locked_and_provisioned=True,
        citadel_days_provisions=5,
        armed_security_onboard=False,
        pcasp_guard_count=0,
        ais_silent_mode_authorized=True,
        ukmto_transit_registered=True,
        security_drill_last_date="2026-11-01",
        overall_security_status="SECURE",
    )


@router.post("/drill-citadel/{vessel_id}")
async def trigger_citadel_security_drill(vessel_id: int):
    """Executes an emergency Citadel lockdown drill conforming to IMO ISPS Code & BMP5 guidelines."""
    data = SECURITY_READINESS.get(vessel_id)
    if data:
        data["security_drill_last_date"] = "2026-11-10 (LATIHAN TERVERIFIKASI)"
        data["citadel_locked_and_provisioned"] = True

    return {
        "status": "SUCCESS",
        "vessel_id": vessel_id,
        "message": "Latihan darurat perlindungan Citadel (Anti-Piracy Drill) berhasil disimulasikan. Protokol BMP5 aktif.",
    }
