from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.vessel import Vessel
from app.schemas.vessel import VesselCreate, VesselResponse, VesselUpdate

router = APIRouter(prefix="/vessels", tags=["Vessels"])


@router.get("", response_model=List[VesselResponse])
async def list_vessels(db: AsyncSession = Depends(get_db)):
    """Retrieve all vessels in fleet."""
    result = await db.execute(select(Vessel).order_by(Vessel.id.asc()))
    return result.scalars().all()


@router.post("", response_model=VesselResponse, status_code=status.HTTP_201_CREATED)
async def create_vessel(payload: VesselCreate, db: AsyncSession = Depends(get_db)):
    """Register a new vessel into the ERP fleet."""
    existing = await db.execute(select(Vessel).where(Vessel.imo_number == payload.imo_number))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vessel with IMO {payload.imo_number} already registered."
        )

    vessel = Vessel(**payload.model_dump())
    db.add(vessel)
    await db.commit()
    await db.refresh(vessel)
    return vessel


@router.get("/{vessel_id}", response_model=VesselResponse)
async def get_vessel(vessel_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch details of a specific vessel."""
    vessel = await db.get(Vessel, vessel_id)
    if not vessel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vessel not found.")
    return vessel


@router.patch("/{vessel_id}", response_model=VesselResponse)
async def update_vessel(vessel_id: int, payload: VesselUpdate, db: AsyncSession = Depends(get_db)):
    """Update operational parameters of a vessel."""
    vessel = await db.get(Vessel, vessel_id)
    if not vessel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vessel not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vessel, field, value)

    await db.commit()
    await db.refresh(vessel)
    return vessel
