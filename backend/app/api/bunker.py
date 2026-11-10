from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.bunker import BunkerLog
from app.models.vessel import Vessel
from app.schemas.bunker import BunkerLogCreate, BunkerLogResponse

router = APIRouter(prefix="/bunker", tags=["Bunker & Fuel Automation"])


@router.get("", response_model=List[BunkerLogResponse])
async def list_bunker_logs(db: AsyncSession = Depends(get_db)):
    """Retrieve bunker records across all vessels."""
    result = await db.execute(select(BunkerLog).order_by(BunkerLog.recorded_at.desc()))
    return result.scalars().all()


@router.post("", response_model=BunkerLogResponse, status_code=status.HTTP_201_CREATED)
async def log_bunker(payload: BunkerLogCreate, db: AsyncSession = Depends(get_db)):
    """
    Log bunker reading and perform automated anomaly detection.
    Flags excessive burn rate (>35% above vessel nominal) as an anomaly.
    """
    vessel = await db.get(Vessel, payload.vessel_id)
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found.")

    anomaly_flag = False
    anomaly_reason = None

    # Automated Anomaly Detection Rule:
    # If daily consumption exceeds 1.35x the vessel's nominal burn rate
    if payload.daily_consumption_mt > (vessel.fuel_burn_rate_mt_per_day * 1.35):
        anomaly_flag = True
        deviation = round(
            ((payload.daily_consumption_mt - vessel.fuel_burn_rate_mt_per_day) / vessel.fuel_burn_rate_mt_per_day) * 100,
            1
        )
        anomaly_reason = f"Excessive fuel consumption (+{deviation}% over nominal {vessel.fuel_burn_rate_mt_per_day} MT/day). Suspected hull fouling or adverse weather."

    log_entry = BunkerLog(
        **payload.model_dump(),
        anomaly_flag=anomaly_flag,
        anomaly_reason=anomaly_reason
    )
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    return log_entry


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bunker_log(log_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a bunker fuel log entry."""
    log_entry = await db.get(BunkerLog, log_id)
    if not log_entry:
        raise HTTPException(status_code=404, detail="Bunker log not found.")
    await db.delete(log_entry)
    await db.commit()
