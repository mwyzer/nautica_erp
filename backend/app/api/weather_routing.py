from typing import Dict, Any
from fastapi import APIRouter, Query

router = APIRouter(prefix="/weather-routing", tags=["AI Weather Routing & Eco Speed"])


@router.get("/simulate", response_model=Dict[str, Any])
async def simulate_weather_routing(
    speed_knots: float = Query(11.5, ge=8.0, le=20.0),
    distance_nm: float = Query(525.0),
    nominal_fuel_burn_mt_day: float = Query(24.0),
):
    """Calculates Eco-Speed vs Full-Speed voyage optimization, weather avoidance, and fuel savings."""
    # Full baseline speed assumption: 14.8 knots
    baseline_speed = 14.8
    baseline_hours = distance_nm / baseline_speed
    baseline_days = baseline_hours / 24.0
    baseline_fuel_mt = baseline_days * nominal_fuel_burn_mt_day
    bunker_price_vlsfo = 645.0  # $645/MT

    # Eco speed calculation based on cubic propeller law (Fuel ~ Speed^3)
    speed_ratio = speed_knots / baseline_speed
    eco_burn_rate_mt_day = nominal_fuel_burn_mt_day * (speed_ratio**2.8)
    eco_hours = distance_nm / speed_knots
    eco_days = eco_hours / 24.0
    eco_fuel_mt = eco_days * eco_burn_rate_mt_day

    fuel_saved_mt = max(0.0, baseline_fuel_mt - eco_fuel_mt)
    cost_saved_usd = fuel_saved_mt * bunker_price_vlsfo
    co2_avoided_mt = fuel_saved_mt * 3.114  # IMO conversion factor for VLSFO

    # Wave condition based on routing through Bangka Strait vs Open Natuna Sea
    max_wave_height = 1.2 if speed_knots <= 12.5 else 1.8

    waypoints = [
        {"name": "WP1 (Tanjung Priok Fairway)", "lat": -5.98, "lng": 106.88, "wind_beaufort": 3},
        {"name": "WP2 (Selat Sunda Timur)", "lat": -4.20, "lng": 106.25, "wind_beaufort": 4},
        {"name": "WP3 (Bangka Strait Safe Corridor)", "lat": -2.15, "lng": 105.35, "wind_beaufort": 3},
        {"name": "WP4 (Riau Archipelago Approach)", "lat": 0.45, "lng": 104.75, "wind_beaufort": 4},
        {"name": "WP5 (Singapore Strait TSS Inward)", "lat": 1.22, "lng": 103.88, "wind_beaufort": 3},
    ]

    return {
        "speed_knots": round(speed_knots, 1),
        "duration_hours": round(eco_hours, 1),
        "fuel_burn_total_mt": round(eco_fuel_mt, 1),
        "bunker_cost_usd": round(eco_fuel_mt * bunker_price_vlsfo, 2),
        "fuel_saved_mt": round(fuel_saved_mt, 1),
        "cost_saved_usd": round(cost_saved_usd, 2),
        "co2_avoided_mt": round(co2_avoided_mt, 1),
        "baseline_full_speed_knots": baseline_speed,
        "baseline_hours": round(baseline_hours, 1),
        "extra_hours_at_sea": round(max(0.0, eco_hours - baseline_hours), 1),
        "is_within_laycan": (eco_hours <= 72.0),
        "max_wave_height_m": max_wave_height,
        "route_description": "Rute teroptimasi AI menghindari gelombang tinggi 2.4m di sebelah timur Natuna dengan melintasi koridor tenang Selat Bangka.",
        "waypoints": waypoints,
    }
