from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.maintenance import MaintenanceTicket
from app.models.vessel import Vessel
from app.schemas.maintenance import MaintenanceTicketCreate, MaintenanceTicketResponse

router = APIRouter(prefix="/maintenance", tags=["Planned Maintenance (PMS)"])


@router.get("", response_model=List[MaintenanceTicketResponse])
async def list_maintenance(db: AsyncSession = Depends(get_db)):
    """List all maintenance and defect tickets."""
    result = await db.execute(select(MaintenanceTicket).order_by(MaintenanceTicket.reported_at.desc()))
    return result.scalars().all()


@router.post("", response_model=MaintenanceTicketResponse, status_code=status.HTTP_201_CREATED)
async def report_defect(payload: MaintenanceTicketCreate, db: AsyncSession = Depends(get_db)):
    """Log an equipment defect or PMS work order."""
    vessel = await db.get(Vessel, payload.vessel_id)
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found.")

    ticket = MaintenanceTicket(**payload.model_dump())
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/resolve", response_model=MaintenanceTicketResponse)
async def resolve_ticket(ticket_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a maintenance defect as resolved."""
    ticket = await db.get(MaintenanceTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Maintenance ticket not found.")

    ticket.status = "RESOLVED"
    ticket.prevents_clearance = False
    await db.commit()
    await db.refresh(ticket)
    return ticket
