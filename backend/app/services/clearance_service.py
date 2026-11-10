from datetime import datetime, date
from typing import Dict, Any, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.voyage import Voyage
from app.models.vessel import Vessel
from app.models.crew import CrewMember, CrewCertification
from app.models.bunker import BunkerLog
from app.models.maintenance import MaintenanceTicket
from app.config import settings


class ClearanceEngine:
    """Deterministic maritime verification engine for port & voyage clearance."""

    @staticmethod
    async def evaluate_voyage(db: AsyncSession, voyage_id: int) -> Dict[str, Any]:
        # 1. Fetch Voyage with Vessel
        result = await db.execute(select(Voyage).where(Voyage.id == voyage_id))
        voyage = result.scalar_one_or_none()
        if not voyage:
            raise ValueError(f"Voyage with id {voyage_id} not found.")

        vessel: Vessel = voyage.vessel

        # 2. Fuel Sufficiency Evaluation
        # Distance & Speed calculations
        speed = vessel.avg_speed_knots if vessel.avg_speed_knots > 0 else 14.0
        voyage_hours = voyage.distance_nm / speed
        voyage_days = voyage_hours / 24.0
        burn_rate = vessel.fuel_burn_rate_mt_per_day
        base_fuel_required = voyage_days * burn_rate
        buffer_multiplier = 1.0 + (settings.BUNKER_SAFETY_BUFFER_PERCENT / 100.0)
        safe_fuel_required = base_fuel_required * buffer_multiplier

        # Fetch latest Bunker ROB for this vessel
        bunker_res = await db.execute(
            select(BunkerLog)
            .where(BunkerLog.vessel_id == vessel.id)
            .order_by(BunkerLog.recorded_at.desc())
        )
        latest_bunker = bunker_res.scalars().first()
        current_rob = latest_bunker.current_rob_mt if latest_bunker else 0.0

        fuel_sufficient = current_rob >= safe_fuel_required
        fuel_ratio = (current_rob / safe_fuel_required) if safe_fuel_required > 0 else 0.0

        fuel_data = {
            "distance_nm": voyage.distance_nm,
            "cruising_speed_knots": speed,
            "estimated_steaming_hours": round(voyage_hours, 1),
            "base_fuel_required_mt": round(base_fuel_required, 2),
            "safe_fuel_required_mt": round(safe_fuel_required, 2),
            "safety_buffer_percent": settings.BUNKER_SAFETY_BUFFER_PERCENT,
            "current_rob_mt": round(current_rob, 2),
            "fuel_sufficiency_score": round(fuel_ratio, 2),
            "is_sufficient": fuel_sufficient,
        }

        # 3. Crew & STCW Compliance Evaluation
        crew_res = await db.execute(
            select(CrewMember).where(CrewMember.assigned_vessel_id == vessel.id)
        )
        crew_list = crew_res.scalars().all()
        
        expired_certs: List[Dict[str, Any]] = []
        crew_details = []
        mandatory_ranks = {"MASTER", "CHIEF_ENGINEER"}
        found_ranks = set()

        voyage_end_date = voyage.estimated_arrival.date()

        for member in crew_list:
            found_ranks.add(member.rank.upper())
            cert_summary = []
            for cert in member.certifications:
                is_expired = cert.expiry_date <= date.today()
                expires_during_voyage = cert.expiry_date <= voyage_end_date
                
                if is_expired or expires_during_voyage:
                    expired_certs.append({
                        "seafarer": member.full_name,
                        "rank": member.rank,
                        "cert_type": cert.cert_type,
                        "cert_number": cert.cert_number,
                        "expiry_date": cert.expiry_date.isoformat(),
                        "reason": "EXPIRED" if is_expired else "EXPIRES_DURING_VOYAGE"
                    })
                cert_summary.append({
                    "cert_type": cert.cert_type,
                    "expiry_date": cert.expiry_date.isoformat(),
                    "valid": not (is_expired or expires_during_voyage)
                })

            crew_details.append({
                "seafarer_id": member.seafarer_id,
                "name": member.full_name,
                "rank": member.rank,
                "cert_count": len(member.certifications)
            })

        missing_critical_ranks = list(mandatory_ranks - found_ranks)
        crew_compliant = (len(expired_certs) == 0) and (len(missing_critical_ranks) == 0)

        crew_data = {
            "total_crew_onboard": len(crew_list),
            "missing_mandatory_officers": missing_critical_ranks,
            "expired_or_expiring_certificates": expired_certs,
            "is_compliant": crew_compliant
        }

        # 4. PMS & Critical Defect Evaluation
        maint_res = await db.execute(
            select(MaintenanceTicket).where(
                and_(
                    MaintenanceTicket.vessel_id == vessel.id,
                    MaintenanceTicket.status.in_(["OPEN", "IN_PROGRESS"])
                )
            )
        )
        open_tickets = maint_res.scalars().all()

        blocking_defects = []
        for ticket in open_tickets:
            if ticket.prevents_clearance or ticket.severity in ["CRITICAL", "HIGH"]:
                blocking_defects.append({
                    "ticket_id": ticket.id,
                    "equipment": ticket.equipment_name,
                    "severity": ticket.severity,
                    "description": ticket.description,
                    "prevents_clearance": ticket.prevents_clearance
                })

        maint_data = {
            "open_tickets_count": len(open_tickets),
            "blocking_defects": blocking_defects,
            "is_seaworthy": len(blocking_defects) == 0
        }

        # 5. Composite Decision Determination
        # Rules:
        # - Any blocking defect OR missing critical officer OR severe fuel deficit (<90% safe) => REJECTED
        # - Safe fuel between 90-100% OR expiring non-critical cert => CONDITIONAL
        # - All clear => APPROVED
        if not maint_data["is_seaworthy"] or len(missing_critical_ranks) > 0 or fuel_ratio < 0.90:
            decision = "REJECTED"
        elif not crew_compliant or not fuel_sufficient:
            decision = "CONDITIONAL"
        else:
            decision = "APPROVED"

        return {
            "voyage_id": voyage.id,
            "voyage_number": voyage.voyage_number,
            "vessel_name": vessel.name,
            "origin": voyage.origin_port,
            "destination": voyage.destination_port,
            "decision": decision,
            "fuel_check": fuel_data,
            "crew_compliance": crew_data,
            "maintenance_status": maint_data,
        }
