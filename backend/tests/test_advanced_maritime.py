import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_iot_engine_telemetry(client: AsyncClient):
    # Test live telemetry stream for vessel 1
    res = await client.get("/api/v1/iot-engine/telemetry/live/1")
    assert res.status_code == 200
    data = res.json()
    assert data["vessel_id"] == 1
    assert data["is_engine_running"] is True
    assert data["engine_rpm"] > 80.0
    assert data["shaft_power_kw"] > 5000.0
    assert data["sfoc_g_kwh"] > 150.0
    assert len(data["cylinders"]) == 6
    assert data["turbocharger"]["rpm"] > 10000
    assert data["vibration"]["iso_10816_class_threshold"] == 4.5

    # Test fault injection
    fault_res = await client.post("/api/v1/iot-engine/fault-injection?vessel_id=1&fault_type=INJECTOR_FOULING_CYL4")
    assert fault_res.status_code == 200
    assert fault_res.json()["active_fault"] == "INJECTOR_FOULING_CYL4"

    # Reset fault
    reset_res = await client.post("/api/v1/iot-engine/fault-injection?vessel_id=1&fault_type=NONE")
    assert reset_res.status_code == 200


@pytest.mark.asyncio
async def test_port_call_jit_schedules(client: AsyncClient):
    # Test get port calls
    res = await client.get("/api/v1/port-call-jit/calls")
    assert res.status_code == 200
    calls = res.json()
    assert len(calls) >= 3
    assert calls[0]["jit_recommended_speed_knots"] > 0
    assert calls[0]["fuel_saved_mt"] > 0

    # Test optimize JIT speed
    opt_payload = {
        "vessel_id": 1,
        "distance_nm": 350.0,
        "target_berth_hours": 32.0,
        "nominal_fuel_burn_mt_day": 26.0,
    }
    opt_res = await client.post("/api/v1/port-call-jit/optimize", json=opt_payload)
    assert opt_res.status_code == 200
    opt_data = opt_res.json()
    assert opt_data["jit_speed_knots"] <= opt_data["full_speed_knots"]
    assert opt_data["fuel_saved_mt"] >= 0
    assert opt_data["cost_saved_usd"] >= 0

    # Test confirm slot
    slot_res = await client.post("/api/v1/port-call-jit/confirm-slot/1")
    assert slot_res.status_code == 200
    assert slot_res.json()["status"] == "SUCCESS"


@pytest.mark.asyncio
async def test_piracy_security_intelligence(client: AsyncClient):
    # Test threat map
    threat_res = await client.get("/api/v1/piracy-security/threat-map")
    assert threat_res.status_code == 200
    threat_data = threat_res.json()
    assert len(threat_data["hra_zones"]) >= 3
    assert len(threat_data["recent_incidents"]) >= 3

    # Test vessel readiness
    readiness_res = await client.get("/api/v1/piracy-security/readiness/1")
    assert readiness_res.status_code == 200
    readiness = readiness_res.json()
    assert readiness["bmp5_compliance_percent"] > 80.0
    assert readiness["citadel_locked_and_provisioned"] is True

    # Test Citadel drill
    drill_res = await client.post("/api/v1/piracy-security/drill-citadel/1")
    assert drill_res.status_code == 200
    assert drill_res.json()["status"] == "SUCCESS"
