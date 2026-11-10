import json
import logging
from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.vessel import Vessel
from app.models.voyage import Voyage
from app.models.bunker import BunkerLog

logger = logging.getLogger(__name__)


class NauticalAIAgent:
    """Maritime AI Superintendent Agent powered by Google Gemini (gemini-3.8-flash)."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai Client: {e}")

    async def generate_clearance_synthesis(self, audit_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesizes clearance audit data into an executive maritime assessment."""
        vessel_name = audit_metrics["vessel_name"]
        voyage_num = audit_metrics["voyage_number"]
        fuel_check = audit_metrics["fuel_check"]
        crew_check = audit_metrics["crew_compliance"]
        maint_check = audit_metrics["maintenance_status"]
        prelim_decision = audit_metrics["decision"]

        # Prompt for Gemini
        system_instruction = (
            "You are Captain Gemini, an experienced Chief Marine Superintendent and Nautical ERP AI Agent. "
            "Your job is to audit vessel voyage readiness according to SOLAS, MARPOL, STCW conventions, and fuel economy rules. "
            "Be authoritative, concise, and provide clear operational directives."
        )

        prompt = f"""
Audit Data for Voyage {voyage_num} (Vessel: {vessel_name}):
- Route: {audit_metrics['origin']} -> {audit_metrics['destination']} ({fuel_check['distance_nm']} NM)
- Fuel (Bunker): Current ROB = {fuel_check['current_rob_mt']} MT, Safe Required (with {fuel_check['safety_buffer_percent']}% buffer) = {fuel_check['safe_fuel_required_mt']} MT. Sufficient: {fuel_check['is_sufficient']}.
- Crew STCW Compliance: Compliant = {crew_check['is_compliant']}. Expired/Expiring certs: {json.dumps(crew_check['expired_or_expiring_certificates'])}. Missing key officers: {crew_check['missing_mandatory_officers']}.
- PMS / Seaworthiness: Seaworthy = {maint_check['is_seaworthy']}. Blocking defects: {json.dumps(maint_check['blocking_defects'])}.
- Preliminary Decision: {prelim_decision}

Respond strictly in JSON format with two keys:
1. "ai_summary": A professional 2-3 paragraph summary analysis explaining the risks and decision rationale.
2. "recommended_actions": A list of 3-5 high-priority bullet points for the port captain and technical superintendent before sailing.
"""

        if self.client:
            try:
                from google.genai import types
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json",
                        temperature=0.2,
                    ),
                )
                parsed = json.loads(response.text)
                return {
                    "decision": prelim_decision,
                    "ai_summary": parsed.get("ai_summary", "Audit completed."),
                    "recommended_actions": parsed.get("recommended_actions", []),
                }
            except Exception as e:
                logger.error(f"Gemini API error, falling back to heuristic engine: {e}")

        # Deterministic / Mock Fallback if API key is not present or failed
        actions = []
        if not fuel_check["is_sufficient"]:
            shortage = round(fuel_check["safe_fuel_required_mt"] - fuel_check["current_rob_mt"], 2)
            actions.append(f"Immediate Bunkering Required: Procure at least {shortage} MT of VLSFO before port departure.")
        else:
            actions.append("Bunker ROB verified sufficient with 15% statutory reserve.")

        if not crew_check["is_compliant"]:
            for item in crew_check["expired_or_expiring_certificates"]:
                actions.append(f"Crew STCW Non-Compliance: Replace or renew {item['cert_type']} for {item['rank']} ({item['seafarer']}).")
            for rank in crew_check["missing_mandatory_officers"]:
                actions.append(f"Manning Table Violation: Assign mandatory officer rank: {rank}.")
        else:
            actions.append("Crew certificates fully compliant with STCW 2010 Manila amendments.")

        if not maint_check["is_seaworthy"]:
            for defect in maint_check["blocking_defects"]:
                actions.append(f"Critical Defect: Class surveyor / Port State Control approval needed for {defect['equipment']} ({defect['severity']}).")
        else:
            actions.append("Hull and machinery systems reported seaworthy with no critical defects.")

        if prelim_decision == "APPROVED":
            summary = (
                f"Voyage {voyage_num} for {vessel_name} has received full Port Clearance Clearance Approval. "
                f"Bunker fuel onboard ({fuel_check['current_rob_mt']} MT) comfortably exceeds the required "
                f"{fuel_check['safe_fuel_required_mt']} MT threshold. All crew members possess valid STCW "
                f"certifications and no critical defects are recorded in the Planned Maintenance System."
            )
        elif prelim_decision == "CONDITIONAL":
            summary = (
                f"Voyage {voyage_num} for {vessel_name} has been placed under CONDITIONAL CLEARANCE. "
                f"Operational discrepancies have been detected. While navigation may proceed under strict "
                f"supervision, pending crew certification endorsements or bunker top-ups must be executed before vessel casts off."
            )
        else:
            summary = (
                f"CLEARANCE REJECTED for Voyage {voyage_num} ({vessel_name}). "
                f"Vessel does not fulfill minimum SOLAS/STCW safety conditions. Departure is strictly prohibited "
                f"until safety defects, fuel shortages, or crew certification compliance issues are resolved."
            )

        return {
            "decision": prelim_decision,
            "ai_summary": summary,
            "recommended_actions": actions,
        }

    async def chat(self, db: AsyncSession, user_message: str) -> Dict[str, Any]:
        """Conversational Maritime Agent capable of querying live fleet data."""
        msg_lower = user_message.lower()

        try:
            # Tool 1: List Fleet / Vessels status
            if any(w in msg_lower for w in ["kapal", "vessel", "armada", "fleet"]):
                res = await db.execute(select(Vessel))
                vessels = res.scalars().all()
                data = [
                    {
                        "name": v.name,
                        "imo": v.imo_number,
                        "type": v.vessel_type,
                        "status": v.status,
                        "port": v.current_port,
                        "burn_rate_mt": v.fuel_burn_rate_mt_per_day
                    }
                    for v in vessels
                ]
                reply = f"Ditemukan {len(vessels)} kapal dalam armada Nautical ERP. Status operasional siap dipantau."
                return {
                    "query": user_message,
                    "reply": reply,
                    "tool_executed": "list_fleet_vessels",
                    "data": data
                }

            # Tool 2: Check Active Voyages
            if any(w in msg_lower for w in ["pelayaran", "voyage", "rute", "berlayar"]):
                res = await db.execute(select(Voyage))
                voyages = res.scalars().all()
                data = [
                    {
                        "voyage_id": v.id,
                        "voyage_number": v.voyage_number,
                        "route": f"{v.origin_port} -> {v.destination_port}",
                        "distance_nm": v.distance_nm,
                        "status": v.status,
                        "clearance": v.clearance_status
                    }
                    for v in voyages
                ]
                reply = f"Terdapat {len(voyages)} rencana pelayaran aktif dalam sistem."
                return {
                    "query": user_message,
                    "reply": reply,
                    "tool_executed": "list_voyages",
                    "data": data
                }

            # Tool 3: Check Bunker Fuel Anomalies
            if any(w in msg_lower for w in ["bunker", "fuel", "bbm", "anomali", "konsumsi"]):
                res = await db.execute(select(BunkerLog).order_by(BunkerLog.recorded_at.desc()).limit(10))
                logs = res.scalars().all()
                anomalies = [l for l in logs if l.anomaly_flag]
                data = [
                    {
                        "vessel_id": l.vessel_id,
                        "fuel_type": l.fuel_type,
                        "current_rob_mt": l.current_rob_mt,
                        "daily_consumption_mt": l.daily_consumption_mt,
                        "anomaly_flag": l.anomaly_flag,
                        "reason": l.anomaly_reason
                    }
                    for l in logs
                ]
                reply = f"Pemeriksaan bunker selesai. Ditemukan {len(anomalies)} anomali konsumsi bahan bakar yang memerlukan investigasi superintendent."
                return {
                    "query": user_message,
                    "reply": reply,
                    "tool_executed": "inspect_bunker_records",
                    "data": data
                }
        except Exception as db_err:
            logger.error(f"Database query error in agent chat: {db_err}")
            return {
                "query": user_message,
                "reply": "Database belum diinisialisasi atau data armada belum tersedia. Silakan jalankan seeder terlebih dahulu.",
                "tool_executed": "db_error_handler",
                "data": None
            }

        # Default AI Response
        if self.client:
            try:
                from google.genai import types
                resp = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=user_message,
                    config=types.GenerateContentConfig(
                        system_instruction="Anda adalah Nautical AI Co-Pilot untuk ERP Perkapalan. Berikan jawaban ringkas maritim profesional.",
                    )
                )
                return {
                    "query": user_message,
                    "reply": resp.text,
                    "tool_executed": "gemini_direct_llm",
                    "data": None
                }
            except Exception as e:
                logger.warning(f"Direct LLM call failed: {e}")

        return {
            "query": user_message,
            "reply": (
                "Halo! Saya Nautical AI Co-Pilot. Anda dapat menanyakan status armada kapal, "
                "verifikasi rencana pelayaran (voyages), log bunker & anomali BBM, atau audit port clearance otomatis."
            ),
            "tool_executed": None,
            "data": None
        }


# Singleton instance
nautical_agent = NauticalAIAgent()
