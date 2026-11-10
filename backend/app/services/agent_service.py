import asyncio
import json
import logging
import os
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.vessel import Vessel
from app.models.voyage import Voyage
from app.models.bunker import BunkerLog

logger = logging.getLogger(__name__)

FALLBACK_MODELS = [
    getattr(settings, "GEMINI_MODEL", "gemini-3.5-flash-lite"),
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
]


class NauticalAIAgent:
    """Maritime AI Superintendent Agent powered by Google Gemini with resilient fallback."""

    def __init__(self):
        self._init_client()

    def _init_client(self):
        self.api_key = os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Google GenAI client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai Client: {e}")

    def _call_gemini_sync(self, contents: str, system_instruction: str, response_mime_type: Optional[str] = None) -> Optional[str]:
        """Synchronous Gemini call with multi-model fallback."""
        if not self.client:
            self._init_client()
        if not self.client:
            return None

        from google.genai import types

        config_args = {"system_instruction": system_instruction, "temperature": 0.2}
        if response_mime_type:
            config_args["response_mime_type"] = response_mime_type
        config = types.GenerateContentConfig(**config_args)

        seen_models = set()
        for model in FALLBACK_MODELS:
            if model in seen_models:
                continue
            seen_models.add(model)
            try:
                logger.info(f"Invoking Gemini model: {model}")
                response = self.client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config,
                )
                if response and response.text:
                    return response.text
            except Exception as err:
                logger.warning(f"Gemini model {model} attempt failed: {err}")
                continue
        return None

    async def _call_gemini(self, contents: str, system_instruction: str, response_mime_type: Optional[str] = None, timeout: float = 6.0) -> Optional[str]:
        """Async wrapper around Gemini with strict timeout to prevent hangs."""
        try:
            return await asyncio.wait_for(
                asyncio.to_thread(self._call_gemini_sync, contents, system_instruction, response_mime_type),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            logger.warning(f"Gemini call timed out after {timeout}s.")
            return None
        except Exception as e:
            logger.warning(f"Gemini execution failed: {e}")
            return None

    async def generate_clearance_synthesis(self, audit_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesizes clearance audit data into an executive maritime assessment."""
        vessel_name = audit_metrics["vessel_name"]
        voyage_num = audit_metrics["voyage_number"]
        fuel_check = audit_metrics["fuel_check"]
        crew_check = audit_metrics["crew_compliance"]
        maint_check = audit_metrics["maintenance_status"]
        prelim_decision = audit_metrics["decision"]

        system_instruction = (
            "You are Captain Gemini, an experienced Chief Marine Superintendent and Nautical ERP AI Agent. "
            "Your job is to audit vessel voyage readiness according to SOLAS, MARPOL, STCW conventions, and fuel economy rules. "
            "Be authoritative, concise, and provide clear operational directives in Indonesian or English."
        )

        prompt = f"""
Audit Data for Voyage {voyage_num} (Vessel: {vessel_name}):
- Route: {audit_metrics['origin']} -> {audit_metrics['destination']} ({fuel_check['distance_nm']} NM)
- Fuel (Bunker): Current ROB = {fuel_check['current_rob_mt']} MT, Safe Required (with {fuel_check['safety_buffer_percent']}% buffer) = {fuel_check['safe_fuel_required_mt']} MT. Sufficient: {fuel_check['is_sufficient']}.
- Crew STCW Compliance: Compliant = {crew_check['is_compliant']}. Expired/Expiring certs: {json.dumps(crew_check['expired_or_expiring_certificates'])}. Missing key officers: {crew_check['missing_mandatory_officers']}.
- PMS / Seaworthiness: Seaworthy = {maint_check['is_seaworthy']}. Blocking defects: {json.dumps(maint_check['blocking_defects'])}.
- Preliminary Decision: {prelim_decision}

Respond strictly in valid JSON format with two keys:
1. "ai_summary": A professional 2-3 paragraph summary analysis explaining the risks and decision rationale.
2. "recommended_actions": A list of 3-5 high-priority bullet points for the port captain and technical superintendent before sailing.
"""

        raw_json = await self._call_gemini(prompt, system_instruction, response_mime_type="application/json", timeout=7.0)
        if raw_json:
            try:
                parsed = json.loads(raw_json)
                return {
                    "decision": prelim_decision,
                    "ai_summary": parsed.get("ai_summary", "Audit completed."),
                    "recommended_actions": parsed.get("recommended_actions", []),
                }
            except Exception as e:
                logger.error(f"Error parsing Gemini JSON response: {e}")

        # Deterministic Marine Superintendent Heuristic Fallback
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
                f"Voyage {voyage_num} untuk kapal {vessel_name} telah memenuhi seluruh kriteria kelaiklautan dan Port Clearance RESMI DISETUJUI. "
                f"Sisa bahan bakar di atas kapal ({fuel_check['current_rob_mt']} MT) melampaui batas aman minimum "
                f"{fuel_check['safe_fuel_required_mt']} MT (dengan buffer 15%). Seluruh awak kapal memiliki sertifikat STCW valid "
                f"dan tidak ada cacat kritis pada sistem PMS."
            )
        elif prelim_decision == "CONDITIONAL":
            summary = (
                f"Voyage {voyage_num} ({vessel_name}) ditempatkan pada status CONDITIONAL CLEARANCE. "
                f"Ditemukan deviasi operasional minor yang harus diselesaikan sebelum kapal bertolak, "
                f"seperti perpanjangan sertifikat kru atau bunkering tambahan di pelabuhan."
            )
        else:
            summary = (
                f"PERINGATAN KELAIKLAUTAN: CLEARANCE DITOLAK untuk Voyage {voyage_num} ({vessel_name}). "
                f"Kapal dilarang berlayar sesuai regulasi SOLAS dan STCW hingga kekurangan cadangan BBM, "
                f"sertifikasi nakhoda/perwira mesin, atau perbaikan mesin kritis diselesaikan."
            )

        return {
            "decision": prelim_decision,
            "ai_summary": summary,
            "recommended_actions": actions,
        }

    async def chat(self, db: AsyncSession, user_message: str) -> Dict[str, Any]:
        """Conversational Maritime Superintendent Agent capable of querying live ERP fleet data."""
        msg_lower = user_message.lower().strip()

        # Tool 0: Maritime Regulation RAG (SOLAS, MARPOL, STCW, SOPEP, ISM Code)
        rag_keywords = [
            "solas", "marpol", "stcw", "sopep", "ism", "sulfur", "belerang", "regulasi",
            "aturan", "konvensi", "hukum", "istirahat", "bdn", "sample", "manila",
            "kelaiklautan", "emisi", "eca", "seca"
        ]
        if any(w in msg_lower for w in rag_keywords):
            try:
                from app.services.rag_service import maritime_rag
                rag_res = await maritime_rag.answer_query(user_message, top_k=3)
                if rag_res.get("is_rag_grounded"):
                    citations_str = "\n\n📚 **Rujukan Regulasi Maritim:**\n" + "\n".join([f"• {c}" for c in rag_res["citations"]])
                    return {
                        "query": user_message,
                        "reply": rag_res["answer"] + citations_str,
                        "tool_executed": "maritime_regulation_rag",
                        "data": rag_res.get("sources")
                    }
            except Exception as rag_err:
                logger.error(f"Error executing Maritime RAG: {rag_err}")

        # Tool 4: Singapore readiness check
        if any(w in msg_lower for w in ["singapura", "singapore"]):
            try:
                res = await db.execute(
                    select(Voyage).join(Vessel).where(Voyage.destination_port.ilike("%SIN%"))
                )
                voyages = res.scalars().all()
                if voyages:
                    v_list = []
                    for v in voyages:
                        v_vessel = await db.get(Vessel, v.vessel_id)
                        v_name = v_vessel.name if v_vessel else f"Vessel #{v.vessel_id}"
                        v_list.append({
                            "voyage_number": v.voyage_number,
                            "vessel": v_name,
                            "route": f"{v.origin_port} -> {v.destination_port}",
                            "status": v.status,
                            "clearance": v.clearance_status
                        })
                    reply = (
                        f"Hasil audit rute Singapura: Ditemukan {len(voyages)} rencana pelayaran menuju Singapore. "
                        f"Kapal yang berstatus CLEARED/APPROVED siap bertolak sesuai jadwal pelayaran."
                    )
                    return {
                        "query": user_message,
                        "reply": reply,
                        "tool_executed": "check_singapore_readiness",
                        "data": v_list
                    }
            except Exception as e:
                logger.error(f"Error querying Singapore voyages: {e}")

        # Tool 3: Bunker Fuel & Anomalies (priority over generic armada query)
        if any(w in msg_lower for w in ["bunker", "fuel", "bbm", "anomali", "konsumsi"]):
            try:
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
                logger.error(f"Database query error in agent chat (bunker): {db_err}")

        # Tool 1: List Fleet / Vessels status
        if any(w in msg_lower for w in ["kapal", "vessel", "armada", "fleet"]):
            try:
                res = await db.execute(select(Vessel))
                vessels = res.scalars().all()
                if not vessels:
                    return {
                        "query": user_message,
                        "reply": "Armada kapal belum terdaftar di database. Silakan jalankan seeder untuk memuat kapal simulasi.",
                        "tool_executed": "list_fleet_vessels",
                        "data": []
                    }
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
                reply = f"Ditemukan {len(vessels)} kapal dalam armada Nautical ERP. Seluruh unit terpantau dalam AIS/ERP."
                return {
                    "query": user_message,
                    "reply": reply,
                    "tool_executed": "list_fleet_vessels",
                    "data": data
                }
            except Exception as db_err:
                logger.error(f"Database query error in agent chat (vessels): {db_err}")

        # Tool 2: Check Voyages
        if any(w in msg_lower for w in ["pelayaran", "voyage", "rute", "berlayar", "jadwal"]):
            try:
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
                reply = f"Terdapat {len(voyages)} rencana pelayaran aktif dalam sistem Nautical ERP."
                return {
                    "query": user_message,
                    "reply": reply,
                    "tool_executed": "list_voyages",
                    "data": data
                }
            except Exception as db_err:
                logger.error(f"Database query error in agent chat (voyages): {db_err}")

        # Tool 3: Bunker Fuel & Anomalies
        if any(w in msg_lower for w in ["bunker", "fuel", "bbm", "anomali", "konsumsi"]):
            try:
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
                logger.error(f"Database query error in agent chat (bunker): {db_err}")

        # Conversational greetings & identity
        if any(w in msg_lower for w in ["halo", "hai", "hello", "siapa", "bantuan", "help", "selamat"]):
            return {
                "query": user_message,
                "reply": (
                    "Halo! Saya Captain Gemini, AI Marine Superintendent untuk Nautical ERP Automation. "
                    "Saya dapat membantu Anda memantau kesiapan armada kapal, audit izin berlayar (port clearance), "
                    "verifikasi sertifikasi STCW kru, dan deteksi anomali bahan bakar (bunker).\n\n"
                    "Silakan gunakan tombol cepat di bawah atau tanyakan data spesifik maritim."
                ),
                "tool_executed": "superintendent_greeting",
                "data": None
            }

        # Direct LLM Generation with multi-model fallback & timeout
        system_instruction = (
            "Anda adalah Captain Gemini, Chief Marine Superintendent dan AI Nautical Co-Pilot. "
            "Jawab pertanyaan pengguna secara profesional, ringkas, dan fokus pada regulasi maritim (SOLAS, MARPOL, STCW, fuel safety)."
        )
        llm_reply = await self._call_gemini(user_message, system_instruction, timeout=6.0)
        if llm_reply:
            return {
                "query": user_message,
                "reply": llm_reply,
                "tool_executed": "gemini_copilot_llm",
                "data": None
            }

        # Universal Maritime Fallback Response
        return {
            "query": user_message,
            "reply": (
                "Captain Gemini siap bertugas. Anda dapat memantau status armada ('Status Armada'), "
                "mendeteksi kebocoran BBM ('Cek Anomali BBM'), atau meninjau kelaiklautan pelayaran ('Rencana Pelayaran')."
            ),
            "tool_executed": "heuristic_maritime_advisory",
            "data": None
        }


# Singleton instance
nautical_agent = NauticalAIAgent()
