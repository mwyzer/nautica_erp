import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_ballast_default_tanks(client: AsyncClient):
    response = await client.get("/api/v1/ballast-stability/tanks/default")
    assert response.status_code == 200
    tanks = response.json()
    assert len(tanks) >= 6
    tank_ids = [t["tank_id"] for t in tanks]
    assert "FPT" in tank_ids
    assert "APT" in tank_ids
    assert "WBT_1P" in tank_ids
    assert "DBT_1" in tank_ids

@pytest.mark.asyncio
async def test_ballast_stability_calculation(client: AsyncClient):
    # Fetch default tanks
    tanks_res = await client.get("/api/v1/ballast-stability/tanks/default")
    tanks = tanks_res.json()

    payload = {
        "vessel_id": 1,
        "displacement_mt": 12000.0,
        "cargo_payload_mt": 8500.0,
        "tanks": tanks,
    }

    response = await client.post("/api/v1/ballast-stability/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "gm_fluid_m" in data
    assert data["gm_fluid_m"] > 0
    assert "trim_m" in data
    assert "list_deg" in data
    assert "bending_moment_percent" in data
    assert "shear_force_percent" in data
    assert "imo_compliance" in data
    assert isinstance(data["recommendations"], list)

@pytest.mark.asyncio
async def test_ballast_exchange_logs(client: AsyncClient):
    # Read logs
    logs_res = await client.get("/api/v1/ballast-stability/exchange-logs")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 3

    # Post a new log entry
    new_entry = {
        "vessel_name": "MV Nusantara Pioneer",
        "log_date": "2026-11-10 12:00",
        "exchange_method": "Flow-Through (300% Vol)",
        "tank_operated": "WBT 2P, 2S",
        "volume_pumped_m3": 950.0,
        "start_lat": -5.12,
        "start_lng": 118.25,
        "distance_offshore_nm": 230.0,
        "water_depth_m": 1100.0,
        "bwms_active": True,
        "tro_residual_ppm": 0.07,
        "uv_reactor_power_kw": 44.0,
        "compliance_standard": "IMO Reg D-2 (Treated Discharge)",
    }
    create_res = await client.post("/api/v1/ballast-stability/exchange-logs", json=new_entry)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["id"] > 0
    assert created["vessel_name"] == "MV Nusantara Pioneer"
    assert created["port_inspector_status"] == "VERIFIED_COMPLIANT"
