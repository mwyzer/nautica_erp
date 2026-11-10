from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.crew import CrewMember, CrewCertification
from app.models.vessel import Vessel
from app.schemas.crew import CrewMemberCreate, CrewMemberResponse, CrewCertCreate, CrewCertResponse

router = APIRouter(prefix="/crew", tags=["Crew & STCW Compliance"])


@router.get("", response_model=List[CrewMemberResponse])
async def list_crew(db: AsyncSession = Depends(get_db)):
    """List all seafarers and their STCW certification status."""
    result = await db.execute(select(CrewMember).order_by(CrewMember.id.asc()))
    return result.scalars().all()


@router.post("", response_model=CrewMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_crew(payload: CrewMemberCreate, db: AsyncSession = Depends(get_db)):
    """Add a new crew member to the roster."""
    existing = await db.execute(select(CrewMember).where(CrewMember.seafarer_id == payload.seafarer_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Seafarer {payload.seafarer_id} already exists.")

    if payload.assigned_vessel_id:
        vessel = await db.get(Vessel, payload.assigned_vessel_id)
        if not vessel:
            raise HTTPException(status_code=404, detail="Assigned vessel does not exist.")

    crew = CrewMember(**payload.model_dump())
    db.add(crew)
    await db.commit()
    await db.refresh(crew)
    return crew


@router.post("/certifications", response_model=CrewCertResponse, status_code=status.HTTP_201_CREATED)
async def add_certification(payload: CrewCertCreate, db: AsyncSession = Depends(get_db)):
    """Attach STCW maritime certificate to a seafarer."""
    crew = await db.get(CrewMember, payload.crew_id)
    if not crew:
        raise HTTPException(status_code=404, detail="Crew member not found.")

    cert = CrewCertification(**payload.model_dump())
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return cert
