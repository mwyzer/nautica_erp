import pytest
from datetime import date, datetime, timezone, timedelta
from app.models.vessel import Vessel
from app.models.crew import CrewMember, CrewCertification
from app.models.maintenance import MaintenanceTicket
from app.models.voyage import Voyage


@pytest.mark.asyncio
async def test_crew_and_stcw_compliance(client, db_session):
    # Setup vessel and crew
    v = Vessel(imo_number="IMO1234567", name="MV Compliance Tester", vessel_type="CONTAINER", dwt=10000.0)
    db_session.add(v)
    await db_session.flush()

    # Expired cert crew
    c1 = CrewMember(seafarer_id="SID-C1", full_name="Officer Expired", rank="FIRST_MATE", assigned_vessel_id=v.id)
    db_session.add(c1)
    await db_session.flush()

    expired_cert = CrewCertification(
        crew_id=c1.id,
        cert_type="STCW_COC",
        cert_number="COC-OLD-99",
        issue_date=date(2018, 1, 1),
        expiry_date=date(2023, 1, 1),
    )
    db_session.add(expired_cert)
    await db_session.commit()

    # Test crew listing
    crew_res = await client.get("/api/v1/crew")
    assert crew_res.status_code == 200
    crew_list = crew_res.json()
    assert len(crew_list) >= 1
    assert any(c["seafarer_id"] == "SID-C1" for c in crew_list)

    # Test creating new certification via endpoint
    new_cert_payload = {
        "crew_id": c1.id,
        "cert_type": "STCW_BST",
        "cert_number": "BST-2026-99",
        "issue_date": "2026-01-01",
        "expiry_date": "2031-01-01",
    }
    cert_post_res = await client.post("/api/v1/crew/certifications", json=new_cert_payload)
    assert cert_post_res.status_code == 201
    assert cert_post_res.json()["cert_number"] == "BST-2026-99"


@pytest.mark.asyncio
async def test_pms_maintenance_tickets(client, db_session):
    v = Vessel(imo_number="IMO2234567", name="MV Maintenance Tester", vessel_type="BULK_CARRIER", dwt=25000.0)
    db_session.add(v)
    await db_session.flush()

    ticket_payload = {
        "vessel_id": v.id,
        "equipment_name": "Auxiliary Generator #2 Turbocharger",
        "description": "Vibration levels exceeding 7.2 mm/s RMS limits",
        "severity": "CRITICAL",
        "prevents_clearance": True,
    }
    create_res = await client.post("/api/v1/maintenance", json=ticket_payload)
    assert create_res.status_code == 201
    ticket = create_res.json()
    assert ticket["severity"] == "CRITICAL"
    assert ticket["status"] == "OPEN"
    t_id = ticket["id"]

    # Resolve ticket
    res_ticket = await client.post(f"/api/v1/maintenance/{t_id}/resolve")
    assert res_ticket.status_code == 200
    assert res_ticket.json()["status"] == "RESOLVED"


@pytest.mark.asyncio
async def test_voyages_api(client, db_session):
    v = Vessel(imo_number="IMO3234567", name="MV Voyage Tester", vessel_type="TANKER", dwt=45000.0)
    db_session.add(v)
    await db_session.flush()

    voyage_payload = {
        "voyage_number": "VOY-UNIT-001",
        "vessel_id": v.id,
        "origin_port": "IDJKT",
        "destination_port": "SGSIN",
        "distance_nm": 520.0,
        "departure_time": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "estimated_arrival": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
        "cargo_type": "Clean Petroleum Products",
        "cargo_weight_mt": 35000.0,
    }
    create_res = await client.post("/api/v1/voyages", json=voyage_payload)
    assert create_res.status_code == 201
    v_data = create_res.json()
    assert v_data["voyage_number"] == "VOY-UNIT-001"
    assert v_data["distance_nm"] == 520.0


@pytest.mark.asyncio
async def test_ais_live_telemetry(client):
    res = await client.get("/api/v1/ais/live")
    assert res.status_code == 200
    fleet = res.json()
    assert isinstance(fleet, list)
    assert len(fleet) > 0
    assert any("heading" in ship for ship in fleet)

    lanes_res = await client.get("/api/v1/ais/sea-lanes")
    assert lanes_res.status_code == 200
    lanes = lanes_res.json()
    assert len(lanes) >= 2


@pytest.mark.asyncio
async def test_cii_decarbonization(client):
    res = await client.get("/api/v1/cii/ratings")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(item["rating_band"] in ["A", "B", "C", "D", "E"] for item in data)


@pytest.mark.asyncio
async def test_chartering_and_laytime(client):
    # Contracts
    contracts_res = await client.get("/api/v1/chartering/contracts")
    assert contracts_res.status_code == 200
    contracts = contracts_res.json()
    assert len(contracts) > 0

    # Laytime calculation: used > allowed triggers Demurrage
    payload = {
        "allowed_hours": 72.0,
        "used_hours": 96.0,  # 24 hours demurrage
        "demurrage_rate_per_day": 15000.0,
        "despatch_rate_per_day": 7500.0,
    }
    calc_res = await client.post("/api/v1/chartering/calculate-laytime", json=payload)
    assert calc_res.status_code == 200
    res_data = calc_res.json()
    assert res_data["result_type"] == "DEMURRAGE"
    assert res_data["settlement_amount_usd"] == 15000.0


@pytest.mark.asyncio
async def test_noon_reports_and_slip(client):
    res = await client.get("/api/v1/noon-reports")
    assert res.status_code == 200
    reports = res.json()
    assert len(reports) > 0
    first_report = reports[0]
    assert "propeller_slip_pct" in first_report
    assert "fuel_burn_24h_mt" in first_report


@pytest.mark.asyncio
async def test_hseq_and_tokyo_mou(client):
    res = await client.get("/api/v1/hseq/incidents")
    assert res.status_code == 200
    incidents = res.json()
    assert len(incidents) > 0

    psc_res = await client.get("/api/v1/hseq/psc-checklists")
    assert psc_res.status_code == 200
    psc = psc_res.json()
    assert len(psc) > 0


@pytest.mark.asyncio
async def test_drydock_projects(client):
    res = await client.get("/api/v1/drydock/projects")
    assert res.status_code == 200
    projects = res.json()
    assert len(projects) > 0
    assert "key_jobs" in projects[0]
    assert "survey_type" in projects[0]


@pytest.mark.asyncio
async def test_weather_routing_eco_speed(client):
    # Test cubic fuel law: GET query simulation
    res = await client.get("/api/v1/weather-routing/simulate?speed_knots=11.5&distance_nm=525.0")
    assert res.status_code == 200
    sim = res.json()
    assert sim["speed_knots"] == 11.5
    assert sim["fuel_saved_mt"] > 0
    assert sim["cost_saved_usd"] > 0
    assert len(sim["waypoints"]) > 0


@pytest.mark.asyncio
async def test_spb_certificate_and_fal_forms(client):
    res = await client.get("/api/v1/spb/records")
    assert res.status_code == 200
    records = res.json()
    assert len(records) > 0

    detail_res = await client.get("/api/v1/spb/1")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "spb_number" in detail
    assert "fal_form_1_summary" in detail
    assert detail["seaworthiness_status"] == "LAIK_LAUT_APPROVED"


@pytest.mark.asyncio
async def test_cargo_stowage_bay_plan(client):
    res = await client.get("/api/v1/stowage/bays")
    assert res.status_code == 200
    bay = res.json()
    assert bay["stability_status"] == "STABLE_COMPLIANT"
    assert bay["stability_metacentric_height_gm_meters"] > 0.15
    assert len(bay["slots"]) > 0


@pytest.mark.asyncio
async def test_crew_payroll_ilo_mlc(client):
    res = await client.get("/api/v1/payroll/slips")
    assert res.status_code == 200
    payroll = res.json()
    assert len(payroll) > 0
    slip = payroll[0]
    assert slip["mlc_2006_compliant"] is True
    assert slip["net_payable_usd"] > 0


@pytest.mark.asyncio
async def test_emergency_alarms_lifecycle(client):
    res = await client.get("/api/v1/alarms/live")
    assert res.status_code == 200
    alarms = res.json()
    assert isinstance(alarms, list)
    assert len(alarms) > 0
    alarm_id = alarms[0]["id"]

    ack_res = await client.post(f"/api/v1/alarms/{alarm_id}/ack")
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "success"
