import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timedelta, date, timezone
from app.main import app
from app.database import engine, Base, AsyncSessionLocal
from app.models.vessel import Vessel
from app.models.crew import CrewMember, CrewCertification
from app.models.voyage import Voyage
from app.models.bunker import BunkerLog


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
async def test_root_and_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "online"

        health = await client.get("/health")
        assert health.status_code == 200
        assert health.json()["status"] == "healthy"

        dashboard = await client.get("/dashboard")
        assert dashboard.status_code == 200
        assert "nautical erp" in dashboard.text.lower()


@pytest.mark.asyncio
async def test_vessel_crud():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "imo_number": "IMO9123456",
            "name": "MV Test Liner",
            "vessel_type": "CONTAINER",
            "dwt": 15000.0,
            "flag_state": "Indonesia",
            "current_port": "IDJKT",
            "avg_speed_knots": 14.0,
            "fuel_burn_rate_mt_per_day": 20.0,
        }
        res = await client.post("/api/v1/vessels", json=payload)
        assert res.status_code == 201
        data = res.json()
        assert data["imo_number"] == "IMO9123456"
        vessel_id = data["id"]

        get_res = await client.get(f"/api/v1/vessels/{vessel_id}")
        assert get_res.status_code == 200
        assert get_res.json()["name"] == "MV Test Liner"


@pytest.mark.asyncio
async def test_bunker_anomaly_detection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create vessel with nominal burn rate of 20 MT/day
        vessel_res = await client.post("/api/v1/vessels", json={
            "imo_number": "IMO9999999",
            "name": "MV Bunker Test",
            "vessel_type": "BULK_CARRIER",
            "dwt": 30000.0,
            "fuel_burn_rate_mt_per_day": 20.0
        })
        v_id = vessel_res.json()["id"]

        # Log excessive consumption of 35 MT/day (> 1.35 * 20 = 27 MT)
        log_res = await client.post("/api/v1/bunker", json={
            "vessel_id": v_id,
            "fuel_type": "VLSFO",
            "current_rob_mt": 100.0,
            "daily_consumption_mt": 35.0,
            "speed_knots": 12.0
        })
        assert log_res.status_code == 201
        bunker_data = log_res.json()
        assert bunker_data["anomaly_flag"] is True
        assert "Excessive fuel consumption" in bunker_data["anomaly_reason"]


@pytest.mark.asyncio
async def test_ai_clearance_audit_workflow():
    # Setup vessel, crew with valid certs, bunker ROB, and voyage
    async with AsyncSessionLocal() as db:
        vessel = Vessel(
            imo_number="IMO9555555",
            name="MV Ocean Voyager",
            vessel_type="CONTAINER",
            dwt=20000.0,
            avg_speed_knots=15.0,
            fuel_burn_rate_mt_per_day=20.0,
        )
        db.add(vessel)
        await db.flush()

        crew1 = CrewMember(
            seafarer_id="SID-TEST-001",
            full_name="Capt. Ocean Master",
            rank="MASTER",
            assigned_vessel_id=vessel.id,
        )
        crew2 = CrewMember(
            seafarer_id="SID-TEST-002",
            full_name="Chief Eng. Power",
            rank="CHIEF_ENGINEER",
            assigned_vessel_id=vessel.id,
        )
        db.add_all([crew1, crew2])
        await db.flush()

        cert1 = CrewCertification(
            crew_id=crew1.id,
            cert_type="STCW_COC",
            cert_number="COC-1234",
            issue_date=date(2023, 1, 1),
            expiry_date=date(2028, 1, 1),
        )
        cert2 = CrewCertification(
            crew_id=crew2.id,
            cert_type="STCW_COC",
            cert_number="COC-5678",
            issue_date=date(2023, 1, 1),
            expiry_date=date(2028, 1, 1),
        )
        db.add_all([cert1, cert2])

        bunker = BunkerLog(
            vessel_id=vessel.id,
            fuel_type="VLSFO",
            current_rob_mt=150.0,
            daily_consumption_mt=20.0,
        )
        db.add(bunker)

        voyage = Voyage(
            voyage_number="VOY-TEST-001",
            vessel_id=vessel.id,
            origin_port="IDJKT",
            destination_port="SGSIN",
            distance_nm=500.0,
            departure_time=datetime.now(timezone.utc) + timedelta(days=1),
            estimated_arrival=datetime.now(timezone.utc) + timedelta(days=3),
            cargo_type="Containers",
            cargo_weight_mt=10000.0,
        )
        db.add(voyage)
        await db.commit()
        v_id = voyage.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Trigger AI clearance audit
        res = await client.post(f"/api/v1/agent/audit-voyage/{v_id}")
        assert res.status_code == 200
        audit = res.json()
        assert audit["decision"] == "APPROVED"
        assert audit["fuel_check"]["is_sufficient"] is True
        assert audit["crew_compliance"]["is_compliant"] is True
        assert len(audit["recommended_actions"]) > 0

        # Test AI chat query
        chat_res = await client.post("/api/v1/agent/chat", json={
            "message": "Tampilkan status armada kapal saya"
        })
        assert chat_res.status_code == 200
        assert chat_res.json()["tool_executed"] == "list_fleet_vessels"
