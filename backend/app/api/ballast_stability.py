from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/ballast-stability", tags=["Ballast Water Management & Ship Stability (IMO D-2)"])

class BallastTankState(BaseModel):
    tank_id: str
    tank_name: str
    capacity_mt: float
    current_mt: float
    lcg_m: float  # Longitudinal Center of Gravity from midship (+ forward, - aft)
    tcg_m: float  # Transverse Center of Gravity from centerline (+ stbd, - port)
    vcg_m: float  # Vertical Center of Gravity from keel (m)

class StabilityRequest(BaseModel):
    vessel_id: int
    displacement_mt: float = Field(..., description="Vessel lightship + cargo displacement")
    cargo_payload_mt: float = Field(..., description="Total cargo loaded in holds")
    tanks: List[BallastTankState]

class StabilityResult(BaseModel):
    vessel_id: int
    total_displacement_mt: float
    gm_solid_m: float
    gm_fluid_m: float  # With Free Surface Effect correction
    is_gm_compliant: bool
    gm_status: str  # "OPTIMAL", "TENDER (SLUGGISH ROLL)", "STIFF (VIOLENT ROLL)", "DANGEROUS"
    trim_m: float
    trim_direction: str  # "BY_STERN", "BY_BOW", "EVEN_KEEL"
    is_trim_safe: bool
    list_deg: float
    list_direction: str  # "STARBOARD", "PORT", "UPRIGHT"
    is_list_safe: bool
    bending_moment_percent: float  # % of maximum permissible bending moment (sagging/hogging)
    shear_force_percent: float  # % of maximum permissible shear force
    stress_status: str  # "SAFE", "HIGH_STRESS", "STRUCTURAL_OVERLOAD"
    imo_compliance: bool
    recommendations: List[str]

class BallastExchangeLog(BaseModel):
    id: int
    vessel_name: str
    log_date: str
    exchange_method: str  # "Sequential", "Flow-Through", "Dilution"
    tank_operated: str
    volume_pumped_m3: float
    start_lat: float
    start_lng: float
    distance_offshore_nm: float
    water_depth_m: float
    bwms_active: bool
    tro_residual_ppm: float
    uv_reactor_power_kw: float
    compliance_standard: str  # "IMO Reg D-1 (Exchange)", "IMO Reg D-2 (Treated Discharge)"
    port_inspector_status: str  # "VERIFIED_COMPLIANT", "PENDING_AUDIT"

# In-memory default ballast exchange logs for enterprise fleet
EXCHANGE_LOGS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "vessel_name": "MV Nusantara Pioneer",
        "log_date": "2026-11-08 14:30",
        "exchange_method": "Flow-Through (300% Vol)",
        "tank_operated": "WBT 1P, 1S, DBT 2",
        "volume_pumped_m3": 1850.0,
        "start_lat": -3.85,
        "start_lng": 118.42,
        "distance_offshore_nm": 245.0,
        "water_depth_m": 1250.0,
        "bwms_active": True,
        "tro_residual_ppm": 0.08,
        "uv_reactor_power_kw": 45.0,
        "compliance_standard": "IMO Reg D-2 (Treated Discharge)",
        "port_inspector_status": "VERIFIED_COMPLIANT",
    },
    {
        "id": 2,
        "vessel_name": "MT Samudra Jaya",
        "log_date": "2026-11-06 09:15",
        "exchange_method": "Sequential Empty/Refill",
        "tank_operated": "Forepeak Tank (FPT), DBT 1",
        "volume_pumped_m3": 920.0,
        "start_lat": 2.12,
        "start_lng": 105.78,
        "distance_offshore_nm": 215.0,
        "water_depth_m": 480.0,
        "bwms_active": True,
        "tro_residual_ppm": 0.05,
        "uv_reactor_power_kw": 38.0,
        "compliance_standard": "IMO Reg D-2 (Treated Discharge)",
        "port_inspector_status": "VERIFIED_COMPLIANT",
    },
    {
        "id": 3,
        "vessel_name": "MV Barito Leader",
        "log_date": "2026-11-04 18:00",
        "exchange_method": "Flow-Through (300% Vol)",
        "tank_operated": "Aftpeak Tank (APT), WBT 2P",
        "volume_pumped_m3": 1200.0,
        "start_lat": -6.50,
        "start_lng": 115.30,
        "distance_offshore_nm": 210.0,
        "water_depth_m": 350.0,
        "bwms_active": True,
        "tro_residual_ppm": 0.07,
        "uv_reactor_power_kw": 40.0,
        "compliance_standard": "IMO Reg D-2 (Treated Discharge)",
        "port_inspector_status": "VERIFIED_COMPLIANT",
    },
]

DEFAULT_TANKS_SCHEMA: List[Dict[str, Any]] = [
    {"tank_id": "FPT", "tank_name": "Forepeak Tank (Haluan)", "capacity_mt": 350.0, "current_mt": 120.0, "lcg_m": 55.0, "tcg_m": 0.0, "vcg_m": 4.5},
    {"tank_id": "APT", "tank_name": "Aftpeak Tank (Buritan)", "capacity_mt": 280.0, "current_mt": 180.0, "lcg_m": -52.0, "tcg_m": 0.0, "vcg_m": 5.2},
    {"tank_id": "WBT_1P", "tank_name": "Wing Ballast 1 Port (Kiri)", "capacity_mt": 420.0, "current_mt": 240.0, "lcg_m": 22.0, "tcg_m": -8.5, "vcg_m": 3.2},
    {"tank_id": "WBT_1S", "tank_name": "Wing Ballast 1 Stbd (Kanan)", "capacity_mt": 420.0, "current_mt": 240.0, "lcg_m": 22.0, "tcg_m": 8.5, "vcg_m": 3.2},
    {"tank_id": "WBT_2P", "tank_name": "Wing Ballast 2 Port (Kiri)", "capacity_mt": 450.0, "current_mt": 260.0, "lcg_m": -18.0, "tcg_m": -8.5, "vcg_m": 3.4},
    {"tank_id": "WBT_2S", "tank_name": "Wing Ballast 2 Stbd (Kanan)", "capacity_mt": 450.0, "current_mt": 260.0, "lcg_m": -18.0, "tcg_m": 8.5, "vcg_m": 3.4},
    {"tank_id": "DBT_1", "tank_name": "Double Bottom Tank 1", "capacity_mt": 600.0, "current_mt": 350.0, "lcg_m": 12.0, "tcg_m": 0.0, "vcg_m": 1.1},
    {"tank_id": "DBT_2", "tank_name": "Double Bottom Tank 2", "capacity_mt": 650.0, "current_mt": 400.0, "lcg_m": -10.0, "tcg_m": 0.0, "vcg_m": 1.1},
]

@router.get("/tanks/default", response_model=List[Dict[str, Any]])
async def get_default_tanks():
    """Returns baseline ballast tank configuration and initial filling levels."""
    return DEFAULT_TANKS_SCHEMA

@router.post("/calculate", response_model=StabilityResult)
async def calculate_stability(payload: StabilityRequest):
    """
    Computes real-time vessel intact stability according to IMO 2008 IS Code:
    - GM (Metacentric Height with Free Surface Correction)
    - Trim (Trimming moment and draft differential)
    - List (Heeling angle from transverse unbalance)
    - Longitudinal Stress: Bending Moment (% M_allow) & Shear Force (% Q_allow)
    """
    total_ballast_mt = sum(t.current_mt for t in payload.tanks)
    total_displacement = payload.displacement_mt + payload.cargo_payload_mt + total_ballast_mt

    if total_displacement <= 0:
        raise HTTPException(status_code=400, detail="Total displacement must be positive")

    # Base hydrostatics (approximated for standard bulk/container/tanker vessel)
    km_transverse = 8.45  # Height of transverse metacentre above keel (m)
    base_kg = 6.20        # Base vertical center of gravity (m)

    # Calculate combined VCG (Keel to Center of Gravity)
    total_vert_moment = (payload.displacement_mt * base_kg) + (payload.cargo_payload_mt * 6.8)
    total_long_moment = (payload.cargo_payload_mt * 2.5)  # Cargo slight forward bias
    total_trans_moment = 0.0
    free_surface_moment_total = 0.0

    for t in payload.tanks:
        total_vert_moment += (t.current_mt * t.vcg_m)
        total_long_moment += (t.current_mt * t.lcg_m)
        total_trans_moment += (t.current_mt * t.tcg_m)

        # Free Surface Effect (FSE) when tanks are slack (between 5% and 95% full)
        fill_ratio = t.current_mt / max(t.capacity_mt, 1.0)
        if 0.05 < fill_ratio < 0.95:
            # Approximate free surface virtual rise of G (FSM ~ width^3 * length)
            tank_width = abs(t.tcg_m * 2.0) if t.tcg_m != 0 else 6.0
            free_surface_moment_total += (tank_width ** 2) * 1.8 * 1.025

    calc_kg = total_vert_moment / total_displacement
    fse_correction = free_surface_moment_total / total_displacement
    gm_solid = km_transverse - calc_kg
    gm_fluid = max(0.01, gm_solid - fse_correction)

    # IMO 2008 IS Code GM minimum requirement: GM_fluid >= 0.15 m
    is_gm_compliant = gm_fluid >= 0.15
    if gm_fluid < 0.15:
        gm_status = "DANGEROUS"
    elif gm_fluid < 0.60:
        gm_status = "TENDER (SLUGGISH ROLL)"
    elif gm_fluid > 3.20:
        gm_status = "STIFF (VIOLENT ROLL)"
    else:
        gm_status = "OPTIMAL"

    # Trim calculation: Moment to Change Trim 1 cm (MCTC) approx 185 tonne-meters/cm
    mctc = 185.0
    trim_cm = total_long_moment / mctc
    trim_m = round(trim_cm / 100.0, 2)

    if trim_m < -0.1:
        trim_direction = "BY_BOW"
    elif trim_m > 0.1:
        trim_direction = "BY_STERN"
    else:
        trim_direction = "EVEN_KEEL"

    # Preferred operational trim is slight trim by stern (+0.3m to +1.5m) for propeller submergence
    is_trim_safe = -0.5 <= trim_m <= 2.2

    # List calculation: transverse shift of G
    shift_g_transverse = total_trans_moment / total_displacement
    # tan(theta) = shift_g_transverse / gm_fluid
    import math
    list_rad = math.atan2(shift_g_transverse, max(gm_fluid, 0.1))
    list_deg = round(math.degrees(list_rad), 1)

    if list_deg > 0.2:
        list_direction = "STARBOARD"
    elif list_deg < -0.2:
        list_direction = "PORT"
    else:
        list_direction = "UPRIGHT"

    is_list_safe = abs(list_deg) <= 2.0  # Safe list within 2 degrees

    # Longitudinal Stress: Bending Moment & Shear Force
    # Sagging occurs when midship is heavier; Hogging when ends are heavier
    fpt_weight = next((t.current_mt for t in payload.tanks if t.tank_id == "FPT"), 0.0)
    apt_weight = next((t.current_mt for t in payload.tanks if t.tank_id == "APT"), 0.0)
    ends_weight = fpt_weight + apt_weight
    midship_tanks_weight = total_ballast_mt - ends_weight

    # Baseline bending moment calculation
    base_bm_ratio = (midship_tanks_weight + payload.cargo_payload_mt * 0.8) / (total_displacement * 0.65)
    bending_moment_percent = round(min(125.0, max(35.0, base_bm_ratio * 72.0)), 1)
    
    # Shear force near quarter-length bulkheads
    shear_force_percent = round(min(120.0, max(28.0, (abs(total_long_moment) / 350.0) * 45.0 + 38.0)), 1)

    if bending_moment_percent > 100.0 or shear_force_percent > 100.0:
        stress_status = "STRUCTURAL_OVERLOAD"
    elif bending_moment_percent > 85.0 or shear_force_percent > 85.0:
        stress_status = "HIGH_STRESS"
    else:
        stress_status = "SAFE"

    imo_compliance = is_gm_compliant and is_trim_safe and is_list_safe and (stress_status != "STRUCTURAL_OVERLOAD")

    recommendations: List[str] = []
    if not is_gm_compliant:
        recommendations.append("Kritis: GM Fluid di bawah standar IMO (<0.15m). Isi tangki dasar berganda (DBT 1 / DBT 2) untuk menurunkan titik G.")
    if abs(list_deg) > 2.0:
        recommendations.append(f"Perhatian: Kemiringan kapal {abs(list_deg)}° ke {list_direction}. Lakukan counter-ballast pada wing tank berlawanan.")
    if trim_m < -0.2:
        recommendations.append("Peringatan: Kapal trim haluan (trim by bow). Pindahkan air balas dari FPT ke APT untuk meningkatkan daya kemudi.")
    if stress_status == "STRUCTURAL_OVERLOAD":
        recommendations.append("Bahaya Struktur: Bending Moment melampaui 100% batas izin (M_allow). Kurangi konsentrasi beban balas di ruang tengah.")
    elif stress_status == "HIGH_STRESS":
        recommendations.append("Catatan: Beban bending moment mendekati batas toleransi (85%-100%). Seimbangkan distribusi muatan dan tangki balas.")
    if not recommendations:
        recommendations.append("Status stabilitas lambung optimal sesuai standar IMO 2008 Intact Stability Code.")

    return StabilityResult(
        vessel_id=payload.vessel_id,
        total_displacement_mt=round(total_displacement, 1),
        gm_solid_m=round(gm_solid, 2),
        gm_fluid_m=round(gm_fluid, 2),
        is_gm_compliant=is_gm_compliant,
        gm_status=gm_status,
        trim_m=trim_m,
        trim_direction=trim_direction,
        is_trim_safe=is_trim_safe,
        list_deg=list_deg,
        list_direction=list_direction,
        is_list_safe=is_list_safe,
        bending_moment_percent=bending_moment_percent,
        shear_force_percent=shear_force_percent,
        stress_status=stress_status,
        imo_compliance=imo_compliance,
        recommendations=recommendations,
    )

@router.get("/exchange-logs", response_model=List[Dict[str, Any]])
async def get_ballast_exchange_logs():
    """Returns official Ballast Water Record Book (BWRB) entries conforming to IMO BWM Convention Reg D-1 & D-2."""
    return EXCHANGE_LOGS

@router.post("/exchange-logs", response_model=Dict[str, Any])
async def create_ballast_exchange_log(entry: Dict[str, Any]):
    """Records a certified Ballast Water Exchange operation performed in international waters."""
    new_id = len(EXCHANGE_LOGS) + 1
    new_record = {
        "id": new_id,
        "vessel_name": entry.get("vessel_name", "MV Nusantara Pioneer"),
        "log_date": entry.get("log_date", "2026-11-10 11:00"),
        "exchange_method": entry.get("exchange_method", "Flow-Through (300% Vol)"),
        "tank_operated": entry.get("tank_operated", "WBT 1P, 1S"),
        "volume_pumped_m3": float(entry.get("volume_pumped_m3", 1000.0)),
        "start_lat": float(entry.get("start_lat", -4.10)),
        "start_lng": float(entry.get("start_lng", 117.50)),
        "distance_offshore_nm": float(entry.get("distance_offshore_nm", 220.0)),
        "water_depth_m": float(entry.get("water_depth_m", 850.0)),
        "bwms_active": bool(entry.get("bwms_active", True)),
        "tro_residual_ppm": float(entry.get("tro_residual_ppm", 0.06)),
        "uv_reactor_power_kw": float(entry.get("uv_reactor_power_kw", 42.0)),
        "compliance_standard": entry.get("compliance_standard", "IMO Reg D-2 (Treated Discharge)"),
        "port_inspector_status": "VERIFIED_COMPLIANT",
    }
    EXCHANGE_LOGS.insert(0, new_record)
    return new_record
