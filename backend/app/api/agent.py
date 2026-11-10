from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.voyage import Voyage
from app.models.ai_audit import AIClearanceAudit
from app.schemas.agent import ClearanceAuditResult, AgentChatRequest, AgentChatResponse
from app.services.clearance_service import ClearanceEngine
from app.services.agent_service import nautical_agent

router = APIRouter(prefix="/agent", tags=["AI Nautical Agent & Clearance Automation"])


@router.post("/audit-voyage/{voyage_id}", response_model=ClearanceAuditResult)
async def audit_voyage_clearance(voyage_id: int, db: AsyncSession = Depends(get_db)):
    """
    Automated Multi-Factor AI Voyage Clearance Audit:
    1. Evaluates bunker fuel sufficiency with statutory safety buffer.
    2. Validates STCW certifications of assigned crew.
    3. Inspects Planned Maintenance System (PMS) critical defects.
    4. Synthesizes findings using Gemini AI Superintendent into formal verdict & actions.
    5. Updates Voyage clearance status in database.
    """
    try:
        metrics = await ClearanceEngine.evaluate_voyage(db, voyage_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # AI Synthesis
    ai_verdict = await nautical_agent.generate_clearance_synthesis(metrics)

    # Persist AI Audit log
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

    # Sync back to Voyage
    voyage = await db.get(Voyage, voyage_id)
    if voyage:
        voyage.clearance_status = ai_verdict["decision"]
        voyage.clearance_notes = ai_verdict["ai_summary"]

    await db.commit()
    await db.refresh(audit_record)

    return ClearanceAuditResult(
        voyage_id=voyage.id,
        voyage_number=voyage.voyage_number,
        vessel_name=metrics["vessel_name"],
        decision=ai_verdict["decision"],
        fuel_check=metrics["fuel_check"],
        crew_compliance=metrics["crew_compliance"],
        maintenance_status=metrics["maintenance_status"],
        ai_summary=ai_verdict["ai_summary"],
        recommended_actions=ai_verdict["recommended_actions"],
        audited_at=audit_record.audited_at,
    )


@router.post("/chat", response_model=AgentChatResponse)
async def agent_copilot_chat(payload: AgentChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Conversational Maritime Ops Co-Pilot.
    Allows operations superintendents to query fleet status, voyage clearance, or bunker logs in natural language.
    """
    result = await nautical_agent.chat(db, payload.message)
    return AgentChatResponse(
        query=result["query"],
        reply=result["reply"],
        tool_executed=result.get("tool_executed"),
        data=result.get("data"),
    )
