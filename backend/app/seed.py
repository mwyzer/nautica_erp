import asyncio
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timedelta, date, timezone
from app.database import AsyncSessionLocal, Base, engine
from app.models.vessel import Vessel
from app.models.crew import CrewMember, CrewCertification
from app.models.voyage import Voyage
from app.models.bunker import BunkerLog
from app.models.maintenance import MaintenanceTicket


async def seed_data():
    """Initializes realistic test data for Nautical ERP portfolio demonstration."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("⚓ Seeding Vessels...")
        v1 = Vessel(
            imo_number="IMO9812345",
            name="MV Nusantara Pioneer",
            vessel_type="CONTAINER",
            dwt=28500.0,
            flag_state="Indonesia",
            status="ACTIVE",
            current_port="IDJKT",
            avg_speed_knots=15.0,
            fuel_burn_rate_mt_per_day=24.0,
        )
        v2 = Vessel(
            imo_number="IMO9754321",
            name="MV Barito Leader",
            vessel_type="BULK_CARRIER",
            dwt=55000.0,
            flag_state="Indonesia",
            status="ACTIVE",
            current_port="IDBDJ",  # Banjarmasin
            avg_speed_knots=12.5,
            fuel_burn_rate_mt_per_day=28.0,
        )
        v3 = Vessel(
            imo_number="IMO9654987",
            name="MT Samudra Jaya",
            vessel_type="TANKER",
            dwt=42000.0,
            flag_state="Indonesia",
            status="IN_MAINTENANCE",
            current_port="IDBPN",  # Balikpapan
            avg_speed_knots=13.0,
            fuel_burn_rate_mt_per_day=26.0,
        )
        db.add_all([v1, v2, v3])
        await db.flush()

        print("⚓ Seeding Crew & Certifications...")
        # Crew for MV Nusantara Pioneer (Fully Compliant)
        c1 = CrewMember(
            seafarer_id="SID-ID-9011",
            full_name="Capt. Hendra Gunawan",
            rank="MASTER",
            assigned_vessel_id=v1.id,
            status="ON_BOARD",
        )
        c2 = CrewMember(
            seafarer_id="SID-ID-9012",
            full_name="Bambang Supriyanto",
            rank="CHIEF_ENGINEER",
            assigned_vessel_id=v1.id,
            status="ON_BOARD",
        )
        db.add_all([c1, c2])
        await db.flush()

        cert1 = CrewCertification(
            crew_id=c1.id,
            cert_type="STCW_MASTER_COC",
            cert_number="COC-ANT-I-8842",
            issue_date=date(2023, 1, 15),
            expiry_date=date(2028, 1, 15),
        )
        cert2 = CrewCertification(
            crew_id=c2.id,
            cert_type="STCW_CHIEF_ENG_COC",
            cert_number="COC-ATT-I-7719",
            issue_date=date(2023, 3, 10),
            expiry_date=date(2028, 3, 10),
        )
        db.add_all([cert1, cert2])

        # Crew for MV Barito Leader (With EXPIRED Cert to trigger compliance failure)
        c3 = CrewMember(
            seafarer_id="SID-ID-7810",
            full_name="Capt. Agus Pratama",
            rank="MASTER",
            assigned_vessel_id=v2.id,
            status="ON_BOARD",
        )
        c4 = CrewMember(
            seafarer_id="SID-ID-7811",
            full_name="Dedi Kurniawan",
            rank="CHIEF_ENGINEER",
            assigned_vessel_id=v2.id,
            status="ON_BOARD",
        )
        db.add_all([c3, c4])
        await db.flush()

        cert3 = CrewCertification(
            crew_id=c3.id,
            cert_type="STCW_MASTER_COC",
            cert_number="COC-ANT-I-9921",
            issue_date=date(2020, 5, 1),
            expiry_date=date(2024, 5, 1),  # EXPIRED!
        )
        cert4 = CrewCertification(
            crew_id=c4.id,
            cert_type="STCW_CHIEF_ENG_COC",
            cert_number="COC-ATT-I-5520",
            issue_date=date(2023, 6, 1),
            expiry_date=date(2027, 6, 1),
        )
        db.add_all([cert3, cert4])

        print("⚓ Seeding Bunker Logs...")
        # MV Nusantara Pioneer has plenty of fuel (120 MT ROB)
        b1 = BunkerLog(
            vessel_id=v1.id,
            fuel_type="VLSFO",
            current_rob_mt=120.0,
            daily_consumption_mt=23.5,
            speed_knots=14.8,
            anomaly_flag=False,
        )
        # MV Barito Leader has fuel shortage (only 12 MT ROB, needs ~45 MT)
        b2 = BunkerLog(
            vessel_id=v2.id,
            fuel_type="VLSFO",
            current_rob_mt=12.0,
            daily_consumption_mt=39.0,  # +39% anomaly!
            speed_knots=12.2,
            anomaly_flag=True,
            anomaly_reason="Excessive fuel burn detected (+39% over nominal burn rate)",
        )
        # MT Samudra Jaya
        b3 = BunkerLog(
            vessel_id=v3.id,
            fuel_type="VLSFO",
            current_rob_mt=250.0,
            daily_consumption_mt=25.8,
            speed_knots=13.0,
            anomaly_flag=False,
        )
        db.add_all([b1, b2, b3])

        print("⚓ Seeding Maintenance Tickets...")
        m1 = MaintenanceTicket(
            vessel_id=v1.id,
            equipment_name="Auxiliary Generator #2",
            severity="LOW",
            status="OPEN",
            description="Routine lube oil filter replacement due at 1000 running hours.",
            prevents_clearance=False,
        )
        m2 = MaintenanceTicket(
            vessel_id=v3.id,
            equipment_name="Steering Gear Hydraulic Actuator",
            severity="CRITICAL",
            status="OPEN",
            description="High pressure hydraulic seal leakage on rudder actuator. SOLAS Chapter II-1 violation.",
            prevents_clearance=True,
        )
        db.add_all([m1, m2])

        print("⚓ Seeding Voyages...")
        now = datetime.now(timezone.utc)
        # Voyage 1: Clean Voyage (Should receive APPROVED)
        voy1 = Voyage(
            voyage_number="VOY-2026-JKT-SIN-001",
            vessel_id=v1.id,
            origin_port="IDJKT",
            destination_port="SGSIN",
            distance_nm=525.0,
            departure_time=now + timedelta(days=1),
            estimated_arrival=now + timedelta(days=3),
            cargo_type="TEU Containers (General Cargo)",
            cargo_weight_mt=18500.0,
            status="PLANNED",
            clearance_status="PENDING",
        )
        # Voyage 2: Barito Leader (Should receive REJECTED due to expired STCW cert & low bunker)
        voy2 = Voyage(
            voyage_number="VOY-2026-BDJ-SUB-002",
            vessel_id=v2.id,
            origin_port="IDBDJ",
            destination_port="IDSUB",
            distance_nm=480.0,
            departure_time=now + timedelta(hours=12),
            estimated_arrival=now + timedelta(days=2),
            cargo_type="Coal in Bulk",
            cargo_weight_mt=48000.0,
            status="PLANNED",
            clearance_status="PENDING",
        )
        # Voyage 3: Samudra Jaya (Should receive REJECTED due to critical steering gear defect)
        voy3 = Voyage(
            voyage_number="VOY-2026-BPN-JKT-003",
            vessel_id=v3.id,
            origin_port="IDBPN",
            destination_port="IDJKT",
            distance_nm=780.0,
            departure_time=now + timedelta(days=2),
            estimated_arrival=now + timedelta(days=5),
            cargo_type="Clean Petroleum Products",
            cargo_weight_mt=35000.0,
            status="PLANNED",
            clearance_status="PENDING",
        )
        db.add_all([voy1, voy2, voy3])

        await db.commit()
        print("✅ Nautical ERP database successfully seeded with realistic maritime scenarios!")


if __name__ == "__main__":
    asyncio.run(seed_data())
