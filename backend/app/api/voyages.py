from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.voyage import Voyage
from app.models.vessel import Vessel
from app.schemas.voyage import VoyageCreate, VoyageResponse, VoyageUpdate

router = APIRouter(prefix="/voyages", tags=["Voyages & Operations"])


@router.get("", response_model=List[VoyageResponse])
async def list_voyages(db: AsyncSession = Depends(get_db)):
    """List all scheduled and ongoing voyages."""
    result = await db.execute(select(Voyage).order_by(Voyage.departure_time.desc()))
    return result.scalars().all()


@router.post("", response_model=VoyageResponse, status_code=status.HTTP_201_CREATED)
async def create_voyage(payload: VoyageCreate, db: AsyncSession = Depends(get_db)):
    """Schedule a new vessel voyage."""
    vessel = await db.get(Vessel, payload.vessel_id)
    if not vessel:
        raise HTTPException(status_code=404, detail="Assigned vessel does not exist.")

    existing = await db.execute(select(Voyage).where(Voyage.voyage_number == payload.voyage_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Voyage {payload.voyage_number} already exists.")

    voyage = Voyage(**payload.model_dump())
    db.add(voyage)
    await db.commit()
    await db.refresh(voyage)
    return voyage


@router.get("/{voyage_id}", response_model=VoyageResponse)
async def get_voyage(voyage_id: int, db: AsyncSession = Depends(get_db)):
    """Get details of a specific voyage."""
    voyage = await db.get(Voyage, voyage_id)
    if not voyage:
        raise HTTPException(status_code=404, detail="Voyage not found.")
    return voyage


@router.patch("/{voyage_id}", response_model=VoyageResponse)
async def update_voyage(voyage_id: int, payload: VoyageUpdate, db: AsyncSession = Depends(get_db)):
    """Update voyage execution status or clearance details."""
    voyage = await db.get(Voyage, voyage_id)
    if not voyage:
        raise HTTPException(status_code=404, detail="Voyage not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(voyage, field, value)

    await db.commit()
    await db.refresh(voyage)
    return voyage


@router.delete("/{voyage_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voyage(voyage_id: int, db: AsyncSession = Depends(get_db)):
    """Cancel and delete a scheduled voyage."""
    voyage = await db.get(Voyage, voyage_id)
    if not voyage:
        raise HTTPException(status_code=404, detail="Voyage not found.")
    await db.delete(voyage)
    await db.commit()
