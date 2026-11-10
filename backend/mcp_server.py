"""Nautical ERP Model Context Protocol (MCP) Server.

Exposes Maritime Fleet, Voyage Clearance, Bunker Monitoring,
and STCW Compliance tools and resources to any MCP-compliant AI client
(Claude Desktop, Antigravity, Cursor, etc.).
"""

import os
import sys
import json
from typing import Dict, Any, List

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from mcp.server.mcpserver import MCPServer
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.vessel import Vessel
from app.models.voyage import Voyage
from app.models.bunker import BunkerLog
from app.models.crew import CrewMember
from app.models.ai_audit import AIClearanceAudit
from app.services.clearance_service import ClearanceEngine
from app.services.agent_service import nautical_agent

# Initialize Modern MCP 2.x Server
mcp = MCPServer("Nautical-ERP-MCP")


# ==============================================================================
# MCP TOOLS
# ==============================================================================

@mcp.tool()
async def audit_voyage_clearance(voyage_id: int) -> str:
    """Perform an automated multi-factor voyage clearance audit on a planned voyage.
    
    Checks:
    1. Bunker fuel sufficiency with statutory safety buffer (15%).
    2. Crew STCW certification validity and mandatory manning table (Master, Chief Eng).
    3. Planned Maintenance System (PMS) critical seaworthiness defects.
    
    Returns the official superintendent clearance verdict, audit score, and required action items.
    """
    async with AsyncSessionLocal() as db:
        try:
            metrics = await ClearanceEngine.evaluate_voyage(db, voyage_id)
        except ValueError as e:
            return json.dumps({"error": str(e)}, indent=2)

        ai_verdict = await nautical_agent.generate_clearance_synthesis(metrics)

        # Update database audit log & voyage clearance
        audit_record = AIClearanceAudit(
            voyage_id=voyage_id,
            decision=ai_verdict["decision"],
            fuel_sufficiency_score=metrics["fuel_check"]["fuel_sufficiency_score"],
            crew_compliance_status="COMPLIANT" if metrics["crew_compliance"]["is_compliant"] else "NON_COMPLIANT",
            maintenance_risk_status="CLEAR" if metrics["maintenance_status"]["is_seaworthy"] else "DEFECT_DETECTED",
            ai_summary=ai_verdict["ai_summary"],
            recommended_actions=ai_verdict["recommended_actions"],
        )
        db.add(audit_record)

        voyage = await db.get(Voyage, voyage_id)
        if voyage:
            voyage.clearance_status = ai_verdict["decision"]
            voyage.clearance_notes = ai_verdict["ai_summary"]

        await db.commit()

        result = {
            "voyage_id": voyage_id,
            "voyage_number": metrics["voyage_number"],
            "vessel_name": metrics["vessel_name"],
            "decision": ai_verdict["decision"],
            "fuel_check": metrics["fuel_check"],
            "crew_compliance": metrics["crew_compliance"],
            "maintenance_status": metrics["maintenance_status"],
            "ai_summary": ai_verdict["ai_summary"],
            "recommended_actions": ai_verdict["recommended_actions"],
        }
        return json.dumps(result, indent=2)


@mcp.tool()
async def list_fleet_vessels() -> str:
    """Retrieve all commercial vessels registered in the Nautical ERP fleet roster."""
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Vessel).order_by(Vessel.id.asc()))
        vessels = res.scalars().all()
        data = [
            {
                "id": v.id,
                "imo_number": v.imo_number,
                "name": v.name,
                "type": v.vessel_type,
                "dwt_mt": v.dwt,
                "flag": v.flag_state,
                "status": v.status,
                "current_port": v.current_port,
                "avg_speed_knots": v.avg_speed_knots,
                "fuel_burn_rate_mt_per_day": v.fuel_burn_rate_mt_per_day,
            }
            for v in vessels
        ]
        return json.dumps(data, indent=2)


@mcp.tool()
async def check_bunker_anomalies() -> str:
    """Scan all fleet bunker consumption records to detect excessive fuel burn anomalies (>35% over nominal)."""
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(BunkerLog).order_by(BunkerLog.recorded_at.desc()))
        logs = res.scalars().all()
        anomalies = [
            {
                "id": l.id,
                "vessel_id": l.vessel_id,
                "fuel_type": l.fuel_type,
                "current_rob_mt": l.current_rob_mt,
                "daily_consumption_mt": l.daily_consumption_mt,
                "anomaly_flag": l.anomaly_flag,
                "reason": l.anomaly_reason,
            }
            for l in logs
            if l.anomaly_flag
        ]
        return json.dumps({"total_anomalies_detected": len(anomalies), "anomalies": anomalies}, indent=2)


@mcp.tool()
async def verify_crew_stcw_compliance(vessel_id: int) -> str:
    """Verify STCW 2010 Manila amendments certification validity for all crew assigned to a vessel."""
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(CrewMember).where(CrewMember.assigned_vessel_id == vessel_id))
        crew = res.scalars().all()
        if not crew:
            return json.dumps({"vessel_id": vessel_id, "message": "No crew currently assigned to this vessel."}, indent=2)

        report = []
        for member in crew:
            certs = [
                {
                    "cert_type": c.cert_type,
                    "cert_number": c.cert_number,
                    "expiry_date": c.expiry_date.isoformat(),
                    "is_valid": c.is_valid,
                }
                for c in member.certifications
            ]
            report.append({
                "seafarer_id": member.seafarer_id,
                "name": member.full_name,
                "rank": member.rank,
                "certifications": certs,
            })

        return json.dumps({"vessel_id": vessel_id, "assigned_crew": report}, indent=2)


@mcp.tool()
async def query_maritime_regulations_rag(query: str) -> str:
    """Semantic RAG retrieval over official maritime conventions (SOLAS, MARPOL Annex VI, STCW Manila 2010, ISM Code).
    
    Use this tool to verify statutory compliance, legal fuel sulfur limits, mandatory seafarer rest hours,
    steering gear seaworthiness rules, or emergency SOPEP response plans.
    """
    from app.services.rag_service import maritime_rag
    result = await maritime_rag.answer_query(query, top_k=3)
    return json.dumps(result, indent=2)


# ==============================================================================
# MCP RESOURCES
# ==============================================================================

@mcp.resource("nautical://vessels/{vessel_id}")
async def get_vessel_resource(vessel_id: int) -> str:
    """Contextual resource returning vessel operational state."""
    async with AsyncSessionLocal() as db:
        vessel = await db.get(Vessel, int(vessel_id))
        if not vessel:
            return json.dumps({"error": "Vessel not found"})
        return json.dumps({
            "imo": vessel.imo_number,
            "name": vessel.name,
            "status": vessel.status,
            "port": vessel.current_port,
            "dwt": vessel.dwt,
            "burn_rate": vessel.fuel_burn_rate_mt_per_day
        }, indent=2)


@mcp.resource("nautical://voyages/{voyage_id}")
async def get_voyage_resource(voyage_id: int) -> str:
    """Contextual resource returning voyage itinerary and clearance status."""
    async with AsyncSessionLocal() as db:
        voyage = await db.get(Voyage, int(voyage_id))
        if not voyage:
            return json.dumps({"error": "Voyage not found"})
        return json.dumps({
            "voyage_number": voyage.voyage_number,
            "route": f"{voyage.origin_port} -> {voyage.destination_port}",
            "distance_nm": voyage.distance_nm,
            "cargo": f"{voyage.cargo_weight_mt} MT of {voyage.cargo_type}",
            "clearance_status": voyage.clearance_status,
            "clearance_notes": voyage.clearance_notes
        }, indent=2)


if __name__ == "__main__":
    # Run the MCP server over standard input/output (stdio)
    mcp.run()
