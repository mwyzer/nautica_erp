from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/port-call-jit", tags=["Port Call Optimization & Just-In-Time (JIT) Arrival Engine"])


class PortCallSchedule(BaseModel):
    id: int
    vessel_id: int
    vessel_name: str
    voyage_number: str
    destination_port: str
    terminal_berth: str
    original_eta: str
    berth_readiness_time: str
    jit_adjusted_eta: str
    distance_remaining_nm: float
    full_ahead_speed_knots: float
    jit_recommended_speed_knots: float
    anchorage_waiting_hours_saved: float
    fuel_saved_mt: float
    cost_saved_usd: float
    co2_reduction_mt: float
    vts_slot_status: str  # "CONFIRMED_JIT", "BERTH_CONGESTED", "PILOT_SCHEDULED"
    pilot_booked: bool
    tugs_allocated: int


class OptimizeJITRequest(BaseModel):
    vessel_id: int
    distance_nm: float
    target_berth_hours: float
    nominal_fuel_burn_mt_day: float = 24.0


class OptimizeJITResponse(BaseModel):
    vessel_id: int
    distance_nm: float
    full_speed_knots: float
    jit_speed_knots: float
    transit_hours_full: float
    transit_hours_jit: float
    anchorage_hours_eliminated: float
    fuel_full_mt: float
    fuel_jit_mt: float
    fuel_saved_mt: float
    cost_saved_usd: float
    co2_saved_mt: float
    recommendation: str


# In-memory default port call schedules
PORT_CALLS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "vessel_id": 1,
        "vessel_name": "MV Nusantara Pioneer",
        "voyage_number": "VOY-2026-NP01",
        "destination_port": "Port of Singapore (PSA Jurong)",
        "terminal_berth": "Berth J04 (Container Terminal)",
        "original_eta": "2026-11-11 06:00",
        "berth_readiness_time": "2026-11-11 20:30",
        "jit_adjusted_eta": "2026-11-11 20:00",
        "distance_remaining_nm": 310.0,
        "full_ahead_speed_knots": 14.5,
        "jit_recommended_speed_knots": 11.2,
        "anchorage_waiting_hours_saved": 14.0,
        "fuel_saved_mt": 12.8,
        "cost_saved_usd": 8256.0,
        "co2_reduction_mt": 39.8,
        "vts_slot_status": "CONFIRMED_JIT",
        "pilot_booked": True,
        "tugs_allocated": 2,
    },
    {
        "id": 2,
        "vessel_id": 2,
        "vessel_name": "MV Barito Leader",
        "voyage_number": "VOY-2026-BL02",
        "destination_port": "Tanjung Priok, Jakarta (NPCT1)",
        "terminal_berth": "Berth 02 (Bulk Coal Quay)",
        "original_eta": "2026-11-12 02:00",
        "berth_readiness_time": "2026-11-12 16:00",
        "jit_adjusted_eta": "2026-11-12 15:30",
        "distance_remaining_nm": 240.0,
        "full_ahead_speed_knots": 13.8,
        "jit_recommended_speed_knots": 10.4,
        "anchorage_waiting_hours_saved": 13.5,
        "fuel_saved_mt": 10.4,
        "cost_saved_usd": 6708.0,
        "co2_reduction_mt": 32.3,
        "vts_slot_status": "CONFIRMED_JIT",
        "pilot_booked": True,
        "tugs_allocated": 2,
    },
    {
        "id": 3,
        "vessel_id": 3,
        "vessel_name": "MT Samudra Jaya",
        "voyage_number": "VOY-2026-SJ03",
        "destination_port": "Balikpapan Pertamina Jetty #3",
        "terminal_berth": "Jetty 03B (Crude Oil Terminal)",
        "original_eta": "2026-11-13 10:00",
        "berth_readiness_time": "2026-11-13 18:00",
        "jit_adjusted_eta": "2026-11-13 17:30",
        "distance_remaining_nm": 180.0,
        "full_ahead_speed_knots": 12.5,
        "jit_recommended_speed_knots": 9.8,
        "anchorage_waiting_hours_saved": 7.5,
        "fuel_saved_mt": 6.2,
        "cost_saved_usd": 3999.0,
        "co2_reduction_mt": 19.3,
        "vts_slot_status": "BERTH_CONGESTED",
        "pilot_booked": False,
        "tugs_allocated": 1,
    },
]


@router.get("/calls", response_model=List[Dict[str, Any]])
async def get_port_call_schedules():
    """Returns all fleet Just-In-Time port arrival slots, virtual arrival speed recommendations, and fuel savings."""
    return PORT_CALLS


@router.post("/optimize", response_model=OptimizeJITResponse)
async def optimize_jit_speed(payload: OptimizeJITRequest):
    """
    Computes Virtual Arrival speed adjustment:
    Matches vessel speed dynamically to berth readiness, eliminating anchorage delay and reducing fuel burn.
    """
    full_speed = 14.5
    hours_full = payload.distance_nm / full_speed
    fuel_burn_full = (hours_full / 24.0) * payload.nominal_fuel_burn_mt_day

    # Target JIT speed to arrive just 30 minutes before berth slot
    target_transit_hours = max(hours_full, payload.target_berth_hours - 0.5)
    jit_speed = round(payload.distance_nm / target_transit_hours, 1)
    jit_speed = max(8.5, min(14.5, jit_speed))

    # Actual JIT transit hours
    hours_jit = payload.distance_nm / jit_speed

    # Cubic propeller power law: Fuel ~ Speed^2.8
    speed_ratio = jit_speed / full_speed
    fuel_burn_rate_jit = payload.nominal_fuel_burn_mt_day * (speed_ratio**2.8)
    fuel_jit = (hours_jit / 24.0) * fuel_burn_rate_jit

    anchorage_eliminated = max(0.0, target_transit_hours - hours_full)
    fuel_saved = max(0.0, fuel_burn_full - fuel_jit)
    bunker_price_vlsfo = 645.0  # USD/MT
    cost_saved = round(fuel_saved * bunker_price_vlsfo, 2)
    co2_saved = round(fuel_saved * 3.114, 1)

    rec = (
        f"Turunkan kecepatan dari {full_speed} knots ke {jit_speed} knots (Eco-Speed JIT). "
        f"Kapal tiba tepat saat dermaga siap, menghemat {round(fuel_saved, 1)} MT BBM (${cost_saved:,.0f} USD) "
        f"dan meniadakan waktu tunggu lego jangkar {round(anchorage_eliminated, 1)} jam."
    )

    return OptimizeJITResponse(
        vessel_id=payload.vessel_id,
        distance_nm=payload.distance_nm,
        full_speed_knots=full_speed,
        jit_speed_knots=jit_speed,
        transit_hours_full=round(hours_full, 1),
        transit_hours_jit=round(hours_jit, 1),
        anchorage_hours_eliminated=round(anchorage_eliminated, 1),
        fuel_full_mt=round(fuel_burn_full, 1),
        fuel_jit_mt=round(fuel_jit, 1),
        fuel_saved_mt=round(fuel_saved, 1),
        cost_saved_usd=cost_saved,
        co2_saved_mt=co2_saved,
        recommendation=rec,
    )


@router.post("/confirm-slot/{call_id}")
async def confirm_port_call_slot(call_id: int):
    """Confirms VTS arrival slot, pilotage, and tugboat reservations."""
    for call in PORT_CALLS:
        if call["id"] == call_id:
            call["vts_slot_status"] = "CONFIRMED_JIT"
            call["pilot_booked"] = True
            call["tugs_allocated"] = max(2, call["tugs_allocated"])
            return {"status": "SUCCESS", "message": f"Slot sandar VTS & pemanduan untuk {call['vessel_name']} telah dikonfirmasi.", "call": call}

    raise HTTPException(status_code=404, detail="Port call not found")
