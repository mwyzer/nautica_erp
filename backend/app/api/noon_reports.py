from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter(prefix="/noon-reports", tags=["Noon Report & Hull Performance"])

NOON_REPORTS_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "vessel_name": "MV Nusantara Pioneer",
        "report_date": "2026-11-10",
        "report_time_utc": "05:00:00Z",  # 12:00 WIB
        "latitude": -1.85,
        "longitude": 105.45,
        "distance_last_24h_nm": 355.0,
        "avg_speed_knots": 14.8,
        "engine_rpm": 92.0,
        "propeller_slip_pct": 3.8,
        "fuel_burn_24h_mt": 23.8,
        "fuel_rob_vlsfo_mt": 145.0,
        "fuel_rob_mgo_mt": 35.0,
        "fresh_water_rob_mt": 180.0,
        "weather_beaufort": 4,
        "sea_state": "Slight to Moderate",
        "hull_fouling_index": "CLEAN",
    },
    {
        "id": 2,
        "vessel_name": "MV Barito Leader",
        "report_date": "2026-11-10",
        "report_time_utc": "05:00:00Z",
        "latitude": -5.35,
        "longitude": 113.80,
        "distance_last_24h_nm": 290.0,
        "avg_speed_knots": 12.1,
        "engine_rpm": 84.0,
        "propeller_slip_pct": 9.2,  # Elevated slip!
        "fuel_burn_24h_mt": 39.2,  # Anomalously high!
        "fuel_rob_vlsfo_mt": 14.0,
        "fuel_rob_mgo_mt": 22.0,
        "fresh_water_rob_mt": 140.0,
        "weather_beaufort": 3,
        "sea_state": "Smooth to Slight",
        "hull_fouling_index": "CRITICAL_CLEANING_REQUIRED",
    },
    {
        "id": 3,
        "vessel_name": "MV Java Horizon",
        "report_date": "2026-11-10",
        "report_time_utc": "05:00:00Z",
        "latitude": -6.40,
        "longitude": 116.20,
        "distance_last_24h_nm": 388.0,
        "avg_speed_knots": 16.2,
        "engine_rpm": 96.0,
        "propeller_slip_pct": 4.1,
        "fuel_burn_24h_mt": 26.8,
        "fuel_rob_vlsfo_mt": 190.0,
        "fuel_rob_mgo_mt": 40.0,
        "fresh_water_rob_mt": 220.0,
        "weather_beaufort": 5,
        "sea_state": "Moderate",
        "hull_fouling_index": "SLIGHT_GROWTH",
    },
]


class NoonReportCreate(BaseModel):
    vessel_name: str
    latitude: float
    longitude: float
    distance_last_24h_nm: float
    avg_speed_knots: float
    engine_rpm: float
    propeller_slip_pct: float
    fuel_burn_24h_mt: float
    fuel_rob_vlsfo_mt: float
    fresh_water_rob_mt: float
    weather_beaufort: int
    sea_state: str


@router.get("", response_model=List[Dict[str, Any]])
async def list_noon_reports():
    """List 24-hour daily noon reports submitted by chief engineers."""
    return NOON_REPORTS_DATA


@router.post("", response_model=Dict[str, Any])
async def submit_noon_report(payload: NoonReportCreate):
    """Logs a new noon telemetry report and calculates hull biofouling index."""
    # Determine hull fouling index based on slip & fuel consumption
    if payload.propeller_slip_pct > 8.0:
        fouling = "CRITICAL_CLEANING_REQUIRED"
    elif payload.propeller_slip_pct > 5.5:
        fouling = "MODERATE_FOULING"
    else:
        fouling = "CLEAN"

    report = {
        "id": len(NOON_REPORTS_DATA) + 1,
        "vessel_name": payload.vessel_name,
        "report_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "report_time_utc": datetime.now(timezone.utc).strftime("%H:%M:%SZ"),
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "distance_last_24h_nm": payload.distance_last_24h_nm,
        "avg_speed_knots": payload.avg_speed_knots,
        "engine_rpm": payload.engine_rpm,
        "propeller_slip_pct": payload.propeller_slip_pct,
        "fuel_burn_24h_mt": payload.fuel_burn_24h_mt,
        "fuel_rob_vlsfo_mt": payload.fuel_rob_vlsfo_mt,
        "fuel_rob_mgo_mt": 30.0,
        "fresh_water_rob_mt": payload.fresh_water_rob_mt,
        "weather_beaufort": payload.weather_beaufort,
        "sea_state": payload.sea_state,
        "hull_fouling_index": fouling,
    }

    NOON_REPORTS_DATA.insert(0, report)
    return report
