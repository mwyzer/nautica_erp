import math
import random
import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/iot-engine", tags=["IoT Engine Room Telemetry & Condition-Based Monitoring (CBM)"])


class CylinderTelemetry(BaseModel):
    cylinder_num: int
    exhaust_temp_c: float
    exhaust_deviation_c: float
    p_max_bar: float
    p_comp_bar: float
    piston_ring_wear_percent: float
    status: str  # "NORMAL", "WARNING_DEVIATION", "CRITICAL_SCAVENGE_FIRE_RISK"


class TurbochargerTelemetry(BaseModel):
    turbo_id: str
    rpm: int
    scavenge_air_pressure_bar: float
    air_cooler_dp_bar: float
    turbine_inlet_temp_c: float
    turbine_outlet_temp_c: float
    vibration_rms_mm_s: float
    status: str  # "HEALTHY", "COOLER_FOULING", "SURGE_RISK"


class LubeOilTelemetry(BaseModel):
    main_bearing_pressure_bar: float
    oil_temp_c: float
    viscosity_cst: float
    water_in_oil_percent: float
    filter_dp_bar: float
    status: str  # "NORMAL", "HIGH_TEMP", "WATER_CONTAMINATION"


class EngineVibrationTelemetry(BaseModel):
    crankshaft_vibration_rms: float
    bearing_vibration_rms: float
    iso_10816_class_threshold: float  # 4.5 mm/s limit
    dominant_frequency_hz: float
    bearing_health_score: float  # 0 to 100%
    status: str  # "NORMAL", "ELEVATED_VIBRATION", "STRUCTURAL_RISK"


class EngineRoomLiveSnapshot(BaseModel):
    vessel_id: int
    vessel_name: str
    engine_model: str
    timestamp: str
    is_engine_running: bool
    engine_rpm: float
    shaft_power_kw: float
    shaft_torque_knm: float
    sfoc_g_kwh: float  # Specific Fuel Oil Consumption (Normal: 165 - 180 g/kWh)
    sfoc_deviation_percent: float
    mean_indicated_pressure_bar: float
    cylinders: List[CylinderTelemetry]
    turbocharger: TurbochargerTelemetry
    lube_oil: LubeOilTelemetry
    vibration: EngineVibrationTelemetry
    cbm_health_grade: str  # "A (OPTIMAL)", "B (ATTENTION)", "C (MAINTENANCE REQUIRED)", "D (CRITICAL)"
    alerts: List[str]
    maintenance_recommendations: List[str]


# Simulated operational state memory per vessel
SIMULATED_FAULTS: Dict[int, str] = {
    2: "INJECTOR_FOULING_CYL4",  # MV Barito Leader has a persistent Cyl 4 deviation
}


@router.get("/telemetry/live/{vessel_id}", response_model=EngineRoomLiveSnapshot)
async def get_live_engine_telemetry(vessel_id: int):
    """
    Returns real-time 1Hz synthetic telemetry from the vessel's Engine Control Room (ECR).
    Simulates thermodynamic parameters of 2-stroke/4-stroke marine diesel propulsion:
    - Cylinder Exhaust gas temps & pressure balance (Cyl 1-6)
    - Turbocharger & Scavenge air pressure
    - Shaft power (kW), Torque (kNm), and Specific Fuel Oil Consumption (SFOC in g/kWh)
    - Condition-Based Vibration Spectrum (ISO 10816-6)
    """
    vessel_names = {
        1: "MV Nusantara Pioneer",
        2: "MV Barito Leader",
        3: "MT Samudra Jaya",
        4: "MV Java Horizon",
        5: "MT Celebes Gas",
        6: "MV Borneo Express",
        7: "TB Bima Perkasa 08",
    }
    vessel_name = vessel_names.get(vessel_id, f"Vessel #{vessel_id}")
    fault_type = SIMULATED_FAULTS.get(vessel_id, "NONE")

    # Time-based micro jitter to simulate active propeller turning
    t = time.time()
    jitter_rpm = math.sin(t / 4.0) * 0.8
    base_rpm = 94.0 + jitter_rpm

    # Baseline shaft power for a Handymax/Panamax bulk/tanker: ~8,500 kW at 94 RPM
    shaft_power_kw = round((base_rpm / 94.0) ** 3 * 8600.0 + math.cos(t / 3.0) * 45.0, 1)
    shaft_torque_knm = round((shaft_power_kw / (2 * math.pi * (base_rpm / 60.0))) / 1000.0, 1)

    # Base SFOC: ~171.5 g/kWh
    base_sfoc = 171.5
    if fault_type == "INJECTOR_FOULING_CYL4":
        sfoc_g_kwh = round(base_sfoc + 8.4 + math.sin(t / 2.0) * 0.5, 1)
        sfoc_deviation = round(((sfoc_g_kwh - base_sfoc) / base_sfoc) * 100.0, 1)
    else:
        sfoc_g_kwh = round(base_sfoc + math.sin(t / 3.0) * 1.2, 1)
        sfoc_deviation = round(((sfoc_g_kwh - base_sfoc) / base_sfoc) * 100.0, 1)

    # 6 Cylinders telemetry calculation
    cylinders: List[CylinderTelemetry] = []
    base_exhaust_temps = [382.0, 386.0, 384.0, 385.0, 381.0, 388.0]
    alerts: List[str] = []
    recommendations: List[str] = []

    for idx, base_temp in enumerate(base_exhaust_temps):
        cyl_id = idx + 1
        dev = math.sin(t / (idx + 2.0)) * 2.5
        temp = base_temp + dev
        p_max = 143.0 + math.cos(t / 3.5) * 1.2
        p_comp = 119.0 + math.sin(t / 4.0) * 0.8
        ring_wear = 12.0 + idx * 2.5
        status = "NORMAL"

        if fault_type == "INJECTOR_FOULING_CYL4" and cyl_id == 4:
            temp += 36.5  # Heavy thermal deviation on Cylinder 4 (+36.5°C)
            p_max -= 7.5  # Lower peak pressure due to poor atomization
            status = "WARNING_DEVIATION"
            alerts.append(f"Cylinder #{cyl_id} Exhaust Gas Temp ({round(temp, 1)}°C) exceeds fleet baseline (+{round(temp - 385.0, 1)}°C deviation).")
            recommendations.append(f"Inspeksi injector nozzle Silinder #{cyl_id} & bersihkan klep buang pada port call berikutnya.")
        elif fault_type == "HIGH_VIBRATION" and cyl_id == 2:
            status = "ELEVATED_VIBRATION"

        deviation_from_mean = round(temp - 384.0, 1)
        cylinders.append(
            CylinderTelemetry(
                cylinder_num=cyl_id,
                exhaust_temp_c=round(temp, 1),
                exhaust_deviation_c=deviation_from_mean,
                p_max_bar=round(p_max, 1),
                p_comp_bar=round(p_comp, 1),
                piston_ring_wear_percent=round(ring_wear, 1),
                status=status,
            )
        )

    # Turbocharger state
    turbo_rpm = int(14200 + math.sin(t / 5.0) * 120)
    scavenge_bar = round(2.45 + math.sin(t / 4.0) * 0.05, 2)
    cooler_dp = 0.08
    turbo_status = "HEALTHY"

    if fault_type == "COOLER_FOULING":
        cooler_dp = 0.28
        turbo_status = "COOLER_FOULING"
        alerts.append("Turbocharger Scavenge Air Cooler differential pressure high (0.28 bar). Fouling detected.")
        recommendations.append("Lakukan chemical washing pada Air Cooler turbocharger untuk memulihkan densitas udara bilas.")

    turbocharger = TurbochargerTelemetry(
        turbo_id="T/C-1 (ABB A100-M)",
        rpm=turbo_rpm,
        scavenge_air_pressure_bar=scavenge_bar,
        air_cooler_dp_bar=cooler_dp,
        turbine_inlet_temp_c=round(412.0 + math.sin(t / 6.0) * 4.0, 1),
        turbine_outlet_temp_c=round(286.0 + math.cos(t / 6.0) * 3.0, 1),
        vibration_rms_mm_s=1.8,
        status=turbo_status,
    )

    # Lube Oil condition
    lube_oil = LubeOilTelemetry(
        main_bearing_pressure_bar=4.35,
        oil_temp_c=47.2,
        viscosity_cst=126.0,
        water_in_oil_percent=0.03,
        filter_dp_bar=0.22,
        status="NORMAL",
    )

    # Vibration spectrum
    vib_rms = 2.45
    vib_status = "NORMAL"
    bearing_score = 94.0

    if fault_type == "HIGH_VIBRATION":
        vib_rms = 5.2
        vib_status = "STRUCTURAL_RISK"
        bearing_score = 68.0
        alerts.append(f"Vibration RMS ({vib_rms} mm/s) melampaui ambang batas ISO 10816 (4.5 mm/s).")
        recommendations.append("Periksa kelonggaran metal duduk (main bearing clearance) & alignment poros baling-baling.")

    vibration = EngineVibrationTelemetry(
        crankshaft_vibration_rms=vib_rms,
        bearing_vibration_rms=round(vib_rms * 0.85, 2),
        iso_10816_class_threshold=4.5,
        dominant_frequency_hz=round(base_rpm / 60.0 * 6.0, 1),  # 6-cylinder firing frequency
        bearing_health_score=bearing_score,
        status=vib_status,
    )

    # CBM overall health grade
    if fault_type == "HIGH_VIBRATION":
        cbm_grade = "D (CRITICAL)"
    elif fault_type in ["INJECTOR_FOULING_CYL4", "COOLER_FOULING"]:
        cbm_grade = "B (ATTENTION)"
    else:
        cbm_grade = "A (OPTIMAL)"
        recommendations.append("Kondisi pembakaran semua silinder seimbang. Mesin beroperasi dalam kurva efisiensi tinggi.")

    return EngineRoomLiveSnapshot(
        vessel_id=vessel_id,
        vessel_name=vessel_name,
        engine_model="MAN B&W 6S50ME-C9.5 (Two-Stroke Marine Diesel)",
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
        is_engine_running=True,
        engine_rpm=round(base_rpm, 1),
        shaft_power_kw=shaft_power_kw,
        shaft_torque_knm=shaft_torque_knm,
        sfoc_g_kwh=sfoc_g_kwh,
        sfoc_deviation_percent=sfoc_deviation,
        mean_indicated_pressure_bar=18.4,
        cylinders=cylinders,
        turbocharger=turbocharger,
        lube_oil=lube_oil,
        vibration=vibration,
        cbm_health_grade=cbm_grade,
        alerts=alerts,
        maintenance_recommendations=recommendations,
    )


@router.post("/fault-injection")
async def inject_simulated_fault(vessel_id: int, fault_type: str = Query("NONE")):
    """Injects or clears a simulated IoT engine fault for demonstration and alert testing."""
    if fault_type == "NONE":
        SIMULATED_FAULTS.pop(vessel_id, None)
    else:
        SIMULATED_FAULTS[vessel_id] = fault_type

    return {
        "vessel_id": vessel_id,
        "active_fault": fault_type,
        "message": f"Kondisi telemetri mesin kapal diperbarui ke: {fault_type}",
    }
