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
    """Initializes comprehensive enterprise test data for Nautical ERP portfolio demonstration."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("⚓ Seeding Vessels (Enterprise Fleet)...")
        # 1. Container Ships
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
        v4 = Vessel(
            imo_number="IMO9843210",
            name="MV Java Horizon",
            vessel_type="CONTAINER",
            dwt=34200.0,
            flag_state="Indonesia",
            status="ACTIVE",
            current_port="IDSUB",
            avg_speed_knots=16.5,
            fuel_burn_rate_mt_per_day=27.5,
        )

        # 2. Bulk Carriers
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
        v6 = Vessel(
            imo_number="IMO9621456",
            name="MV Borneo Express",
            vessel_type="BULK_CARRIER",
            dwt=63500.0,
            flag_state="Indonesia",
            status="ACTIVE",
            current_port="IDPNK",  # Pontianak
            avg_speed_knots=13.5,
            fuel_burn_rate_mt_per_day=31.0,
        )

        # 3. Tankers & Gas Carriers
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
        v5 = Vessel(
            imo_number="IMO9789012",
            name="MT Celebes Gas",
            vessel_type="TANKER",
            dwt=18500.0,
            flag_state="Indonesia",
            status="ACTIVE",
            current_port="IDMAK",  # Makassar
            avg_speed_knots=14.0,
            fuel_burn_rate_mt_per_day=21.0,
        )

        # 4. Tug & Barge Offshore
        v7 = Vessel(
            imo_number="IMO9512389",
            name="TB Bima Perkasa 08",
            vessel_type="TUG_BARGE",
            dwt=4800.0,
            flag_state="Indonesia",
            status="ACTIVE",
            current_port="IDBTM",  # Batam
            avg_speed_knots=9.5,
            fuel_burn_rate_mt_per_day=8.5,
        )

        all_vessels = [v1, v2, v3, v4, v5, v6, v7]
        db.add_all(all_vessels)
        await db.flush()

        print("⚓ Seeding Crew & STCW Certifications (All Ranks)...")
        crew_data = [
            # v1: MV Nusantara Pioneer
            {"sid": "SID-ID-9011", "name": "Capt. Hendra Gunawan", "rank": "MASTER", "vessel_id": v1.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-9012", "name": "Bambang Supriyanto", "rank": "CHIEF_ENGINEER", "vessel_id": v1.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-9013", "name": "Fajar Nugraha", "rank": "CHIEF_OFFICER", "vessel_id": v1.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-9014", "name": "Rian Hidayat", "rank": "ABLE_SEAMAN", "vessel_id": v1.id, "status": "ON_BOARD"},

            # v2: MV Barito Leader (With 1 expired cert for testing compliance)
            {"sid": "SID-ID-7810", "name": "Capt. Agus Pratama", "rank": "MASTER", "vessel_id": v2.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-7811", "name": "Dedi Kurniawan", "rank": "CHIEF_ENGINEER", "vessel_id": v2.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-7812", "name": "Budi Santoso", "rank": "2ND_ENGINEER", "vessel_id": v2.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-7813", "name": "Wahyu Hidayatullah", "rank": "BOSUN", "vessel_id": v2.id, "status": "ON_BOARD"},

            # v3: MT Samudra Jaya
            {"sid": "SID-ID-6510", "name": "Capt. Johanes Situmorang", "rank": "MASTER", "vessel_id": v3.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-6511", "name": "Achmad Syaifullah", "rank": "CHIEF_ENGINEER", "vessel_id": v3.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-6512", "name": "Rizky Ramadhan", "rank": "PUMPMAN", "vessel_id": v3.id, "status": "ON_BOARD"},

            # v4: MV Java Horizon
            {"sid": "SID-ID-5401", "name": "Capt. Irwan Setiawan", "rank": "MASTER", "vessel_id": v4.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-5402", "name": "Gunawan Wibowo", "rank": "CHIEF_ENGINEER", "vessel_id": v4.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-5403", "name": "Doni Kusuma", "rank": "ELECTRICAL_OFFICER", "vessel_id": v4.id, "status": "ON_BOARD"},

            # v5: MT Celebes Gas
            {"sid": "SID-ID-4301", "name": "Capt. Denny Manopo", "rank": "MASTER", "vessel_id": v5.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-4302", "name": "Hasan Basri", "rank": "CHIEF_ENGINEER", "vessel_id": v5.id, "status": "ON_BOARD"},

            # v6: MV Borneo Express
            {"sid": "SID-ID-3201", "name": "Capt. Suryanto Hadi", "rank": "MASTER", "vessel_id": v6.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-3202", "name": "Lukman Hakim", "rank": "CHIEF_ENGINEER", "vessel_id": v6.id, "status": "ON_BOARD"},

            # v7: TB Bima Perkasa 08
            {"sid": "SID-ID-2101", "name": "Capt. Anton Wijaya", "rank": "MASTER", "vessel_id": v7.id, "status": "ON_BOARD"},
            {"sid": "SID-ID-2102", "name": "Samsul Bahri", "rank": "CHIEF_ENGINEER", "vessel_id": v7.id, "status": "ON_BOARD"},

            # Seafarers On Shore / Standby
            {"sid": "SID-ID-1001", "name": "Capt. Eko Prasetyo", "rank": "MASTER", "vessel_id": None, "status": "ON_SHORE"},
            {"sid": "SID-ID-1002", "name": "Arif Rahman", "rank": "CHIEF_ENGINEER", "vessel_id": None, "status": "ON_SHORE"},
            {"sid": "SID-ID-1003", "name": "Bayu Aditya", "rank": "CHIEF_OFFICER", "vessel_id": None, "status": "ON_LEAVE"},
        ]

        crew_instances = []
        for c in crew_data:
            cm = CrewMember(
                seafarer_id=c["sid"],
                full_name=c["name"],
                rank=c["rank"],
                assigned_vessel_id=c["vessel_id"],
                status=c["status"],
            )
            crew_instances.append(cm)
            db.add(cm)

        await db.flush()

        # Attach STCW Certifications
        certifications = [
            # Capt. Hendra Gunawan (v1)
            CrewCertification(crew_id=crew_instances[0].id, cert_type="STCW_MASTER_COC", cert_number="COC-ANT-I-8842", issue_date=date(2023, 1, 15), expiry_date=date(2028, 1, 15), is_valid=True),
            CrewCertification(crew_id=crew_instances[0].id, cert_type="GMDSS_GENERAL_OPERATOR", cert_number="GMDSS-2023-112", issue_date=date(2023, 2, 1), expiry_date=date(2028, 2, 1), is_valid=True),
            CrewCertification(crew_id=crew_instances[0].id, cert_type="MEDICAL_FITNESS", cert_number="MED-ID-2026-90", issue_date=date(2026, 1, 10), expiry_date=date(2028, 1, 10), is_valid=True),

            # Bambang Supriyanto (v1)
            CrewCertification(crew_id=crew_instances[1].id, cert_type="STCW_CHIEF_ENG_COC", cert_number="COC-ATT-I-7719", issue_date=date(2023, 3, 10), expiry_date=date(2028, 3, 10), is_valid=True),
            CrewCertification(crew_id=crew_instances[1].id, cert_type="ADVANCED_FIRE_FIGHTING", cert_number="AFF-2024-05", issue_date=date(2024, 1, 5), expiry_date=date(2029, 1, 5), is_valid=True),

            # Capt. Agus Pratama (v2 - EXPIRED CERT to trigger rejection)
            CrewCertification(crew_id=crew_instances[4].id, cert_type="STCW_MASTER_COC", cert_number="COC-ANT-I-9921", issue_date=date(2020, 5, 1), expiry_date=date(2024, 5, 1), is_valid=False),

            # Dedi Kurniawan (v2)
            CrewCertification(crew_id=crew_instances[5].id, cert_type="STCW_CHIEF_ENG_COC", cert_number="COC-ATT-I-5520", issue_date=date(2023, 6, 1), expiry_date=date(2027, 6, 1), is_valid=True),

            # Capt. Johanes Situmorang (v3)
            CrewCertification(crew_id=crew_instances[8].id, cert_type="STCW_MASTER_COC", cert_number="COC-ANT-I-6644", issue_date=date(2022, 9, 1), expiry_date=date(2027, 9, 1), is_valid=True),
            CrewCertification(crew_id=crew_instances[8].id, cert_type="OIL_CHEMICAL_TANKER_COP", cert_number="COP-TANKER-99", issue_date=date(2022, 10, 1), expiry_date=date(2027, 10, 1), is_valid=True),

            # Capt. Irwan Setiawan (v4)
            CrewCertification(crew_id=crew_instances[11].id, cert_type="STCW_MASTER_COC", cert_number="COC-ANT-I-3321", issue_date=date(2024, 2, 1), expiry_date=date(2029, 2, 1), is_valid=True),

            # Capt. Denny Manopo (v5)
            CrewCertification(crew_id=crew_instances[14].id, cert_type="STCW_MASTER_COC", cert_number="COC-ANT-I-1144", issue_date=date(2023, 8, 1), expiry_date=date(2028, 8, 1), is_valid=True),
            CrewCertification(crew_id=crew_instances[14].id, cert_type="GAS_TANKER_CARGO_COP", cert_number="COP-GAS-8812", issue_date=date(2023, 9, 1), expiry_date=date(2028, 9, 1), is_valid=True),

            # Capt. Suryanto Hadi (v6)
            CrewCertification(crew_id=crew_instances[16].id, cert_type="STCW_MASTER_COC", cert_number="COC-ANT-I-7744", issue_date=date(2025, 1, 10), expiry_date=date(2030, 1, 10), is_valid=True),

            # Capt. Anton Wijaya (v7)
            CrewCertification(crew_id=crew_instances[18].id, cert_type="STCW_MASTER_COC", cert_number="COC-ANT-II-998", issue_date=date(2023, 4, 1), expiry_date=date(2028, 4, 1), is_valid=True),
        ]
        db.add_all(certifications)

        print("⚓ Seeding Bunker Logs (Telemetry & Fuel Stocks)...")
        bunker_logs = [
            # v1: MV Nusantara Pioneer (Healthy)
            BunkerLog(vessel_id=v1.id, fuel_type="VLSFO", current_rob_mt=145.0, daily_consumption_mt=23.5, speed_knots=14.8, anomaly_flag=False),
            BunkerLog(vessel_id=v1.id, fuel_type="LSMGO", current_rob_mt=35.0, daily_consumption_mt=2.8, speed_knots=14.8, anomaly_flag=False),

            # v2: MV Barito Leader (Critical Anomaly + Low ROB)
            BunkerLog(
                vessel_id=v2.id,
                fuel_type="VLSFO",
                current_rob_mt=14.0,  # Insufficient fuel
                daily_consumption_mt=39.2,
                speed_knots=12.2,
                anomaly_flag=True,
                anomaly_reason="High consumption anomaly (+40% deviation from baseline curve)",
            ),

            # v3: MT Samudra Jaya
            BunkerLog(vessel_id=v3.id, fuel_type="VLSFO", current_rob_mt=280.0, daily_consumption_mt=25.2, speed_knots=13.0, anomaly_flag=False),
            BunkerLog(vessel_id=v3.id, fuel_type="LSMGO", current_rob_mt=60.0, daily_consumption_mt=3.5, speed_knots=13.0, anomaly_flag=False),

            # v4: MV Java Horizon (Healthy)
            BunkerLog(vessel_id=v4.id, fuel_type="VLSFO", current_rob_mt=190.0, daily_consumption_mt=26.8, speed_knots=16.2, anomaly_flag=False),

            # v5: MT Celebes Gas
            BunkerLog(vessel_id=v5.id, fuel_type="VLSFO", current_rob_mt=110.0, daily_consumption_mt=20.5, speed_knots=13.8, anomaly_flag=False),

            # v6: MV Borneo Express
            BunkerLog(vessel_id=v6.id, fuel_type="VLSFO", current_rob_mt=220.0, daily_consumption_mt=30.4, speed_knots=13.4, anomaly_flag=False),

            # v7: TB Bima Perkasa 08
            BunkerLog(vessel_id=v7.id, fuel_type="HSD_MGO", current_rob_mt=42.0, daily_consumption_mt=8.2, speed_knots=9.2, anomaly_flag=False),
        ]
        db.add_all(bunker_logs)

        print("⚓ Seeding Maintenance Tickets (PMS & Defect Management)...")
        tickets = [
            # v1: Routine PMS
            MaintenanceTicket(
                vessel_id=v1.id,
                equipment_name="Auxiliary Generator #2",
                severity="LOW",
                status="OPEN",
                description="Routine lube oil filter replacement due at 1000 running hours.",
                prevents_clearance=False,
            ),
            MaintenanceTicket(
                vessel_id=v1.id,
                equipment_name="ECDIS & Radar S-Band Display",
                severity="MEDIUM",
                status="RESOLVED",
                description="Backup ECDIS display flicker rectified after cable termination cleaning.",
                prevents_clearance=False,
            ),

            # v3: MT Samudra Jaya (CRITICAL SOLAS Blocker)
            MaintenanceTicket(
                vessel_id=v3.id,
                equipment_name="Steering Gear Hydraulic Actuator",
                severity="CRITICAL",
                status="OPEN",
                description="High pressure hydraulic seal leakage on rudder actuator. SOLAS Chapter II-1 Reg 29 violation.",
                prevents_clearance=True,
            ),
            MaintenanceTicket(
                vessel_id=v3.id,
                equipment_name="Inert Gas System (IGS) Scrubber Tower",
                severity="HIGH",
                status="IN_PROGRESS",
                description="Differential pressure high on demister pads. Cleaning scheduled during port stay.",
                prevents_clearance=False,
            ),

            # v2: MV Barito Leader
            MaintenanceTicket(
                vessel_id=v2.id,
                equipment_name="Main Engine Fuel Injection Pump #4",
                severity="MEDIUM",
                status="OPEN",
                description="High exhaust gas temperature deviation (+35°C). Plunger replacement required.",
                prevents_clearance=False,
            ),

            # v4: MV Java Horizon
            MaintenanceTicket(
                vessel_id=v4.id,
                equipment_name="Lifeboat On-Load Release Gear",
                severity="LOW",
                status="RESOLVED",
                description="Annual SOLAS III/20 inspection and dynamic brake test completed successfully.",
                prevents_clearance=False,
            ),

            # v5: MT Celebes Gas
            MaintenanceTicket(
                vessel_id=v5.id,
                equipment_name="Cargo Compressor Cryogenic Seal",
                severity="HIGH",
                status="OPEN",
                description="Minor boil-off gas vapor seepage around flange seal. Tightened to specified torque.",
                prevents_clearance=False,
            ),

            # v6: MV Borneo Express
            MaintenanceTicket(
                vessel_id=v6.id,
                equipment_name="Oily Water Separator (OWS 15 ppm Bilge Alarm)",
                severity="CRITICAL",
                status="IN_PROGRESS",
                description="MARPOL Annex I sensor calibration drift. Requires recalibration before discharge.",
                prevents_clearance=True,
            ),
        ]
        db.add_all(tickets)

        print("⚓ Seeding Voyages (Maritime Scheduling)...")
        now = datetime.now(timezone.utc)
        voyages = [
            # Voyage 1: Clean Voyage (APPROVED)
            Voyage(
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
                clearance_status="APPROVED",
                clearance_notes="AI Port Clearance verified: STCW manning compliant, bunker sufficient (+145 MT ROB), zero SOLAS blockers.",
            ),

            # Voyage 2: Barito Leader (REJECTED due to expired STCW & low fuel)
            Voyage(
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
                clearance_status="REJECTED",
                clearance_notes="REJECTED: Master STCW CoC expired on 2024-05-01. Bunker ROB 14 MT below required safe voyage reserve.",
            ),

            # Voyage 3: Samudra Jaya (REJECTED due to steering gear defect)
            Voyage(
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
                clearance_status="REJECTED",
                clearance_notes="REJECTED: Unresolved CRITICAL defect on Steering Gear Hydraulic Actuator violates SOLAS Chapter II-1.",
            ),

            # Voyage 4: Java Horizon (IN_PROGRESS)
            Voyage(
                voyage_number="VOY-2026-SUB-MAK-004",
                vessel_id=v4.id,
                origin_port="IDSUB",
                destination_port="IDMAK",
                distance_nm=510.0,
                departure_time=now - timedelta(days=1),
                estimated_arrival=now + timedelta(days=1),
                cargo_type="Reefer & Dry Containers",
                cargo_weight_mt=22400.0,
                status="IN_PROGRESS",
                clearance_status="APPROVED",
                clearance_notes="SPB/SIB Digital Clearance issued by Syahbandar Tanjung Perak.",
            ),

            # Voyage 5: Celebes Gas (PLANNED)
            Voyage(
                voyage_number="VOY-2026-MAK-BIT-005",
                vessel_id=v5.id,
                origin_port="IDMAK",
                destination_port="IDBIT",
                distance_nm=620.0,
                departure_time=now + timedelta(days=3),
                estimated_arrival=now + timedelta(days=6),
                cargo_type="LPG Pressurized Liquid",
                cargo_weight_mt=14200.0,
                status="PLANNED",
                clearance_status="PENDING",
            ),

            # Voyage 6: Borneo Express (PENDING)
            Voyage(
                voyage_number="VOY-2026-PNK-CBN-006",
                vessel_id=v6.id,
                origin_port="IDPNK",
                destination_port="IDCBN",
                distance_nm=410.0,
                departure_time=now + timedelta(days=1, hours=6),
                estimated_arrival=now + timedelta(days=3),
                cargo_type="Bauxite Ore in Bulk",
                cargo_weight_mt=58000.0,
                status="PLANNED",
                clearance_status="PENDING",
            ),

            # Voyage 7: Bima Perkasa 08 (COMPLETED)
            Voyage(
                voyage_number="VOY-2026-BTM-TPP-007",
                vessel_id=v7.id,
                origin_port="IDBTM",
                destination_port="MYTPP",
                distance_nm=85.0,
                departure_time=now - timedelta(days=3),
                estimated_arrival=now - timedelta(days=2),
                cargo_type="Fabricated Steel Structures",
                cargo_weight_mt=3200.0,
                status="COMPLETED",
                clearance_status="APPROVED",
            ),
        ]
        db.add_all(voyages)

        await db.commit()
        print("✅ Nautical ERP database successfully populated with rich enterprise data across all modules!")


if __name__ == "__main__":
    asyncio.run(seed_data())
