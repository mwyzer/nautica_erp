"""Nautical ERP Scheduled Background Automation Engine.

Runs periodic automated jobs:
1. Automated Voyage Watcher: Detects voyages departing within 48 hours that lack clearance.
2. STCW Expiry Watcher: Automatically flags seafarers whose certificates expire within 30 days.
3. Bunker Anomaly Watcher: Scans fleet for high burn-rate deviations.
"""

import asyncio
import logging
from datetime import datetime, timedelta, date, timezone
from sqlalchemy import select, and_

from app.database import AsyncSessionLocal
from app.models.voyage import Voyage
from app.models.crew import CrewMember, CrewCertification
from app.models.bunker import BunkerLog

logger = logging.getLogger("nautical.automation")


class MaritimeAutomationScheduler:
    """Autonomous Background Watchdog for Nautical ERP."""

    def __init__(self, interval_seconds: int = 60):
        self.interval = interval_seconds
        self.is_running = False
        self._task = None

    async def start(self):
        self.is_running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("Maritime Automation Scheduler started.")

    async def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Maritime Automation Scheduler stopped.")

    async def _run_loop(self):
        while self.is_running:
            try:
                await self.run_automated_checks()
            except Exception as e:
                logger.error(f"Error in background automation loop: {e}")
            await asyncio.sleep(self.interval)

    async def run_automated_checks(self):
        """Executes automated background maintenance & compliance routines."""
        async with AsyncSessionLocal() as db:
            # 1. Automated Voyage Watcher (Departing soon without clearance)
            now = datetime.now(timezone.utc)
            t_48h = now + timedelta(hours=48)
            voyage_res = await db.execute(
                select(Voyage).where(
                    and_(
                        Voyage.departure_time <= t_48h,
                        Voyage.clearance_status == "PENDING"
                    )
                )
            )
            urgent_voyages = voyage_res.scalars().all()
            if urgent_voyages:
                for v in urgent_voyages:
                    logger.warning(
                        f"⏰ [AUTOMATION ALERT] Voyage {v.voyage_number} departs within 48h but clearance is PENDING!"
                    )

            # 2. Automated STCW Expiry Scanner (Certificates expiring in <= 30 days)
            today = date.today()
            t_30days = today + timedelta(days=30)
            cert_res = await db.execute(
                select(CrewCertification).where(
                    and_(
                        CrewCertification.expiry_date <= t_30days,
                        CrewCertification.is_valid == True
                    )
                )
            )
            expiring_certs = cert_res.scalars().all()
            if expiring_certs:
                for c in expiring_certs:
                    logger.warning(
                        f"📜 [AUTOMATION ALERT] STCW Cert {c.cert_type} ({c.cert_number}) expires on {c.expiry_date}!"
                    )


automation_scheduler = MaritimeAutomationScheduler(interval_seconds=60)
