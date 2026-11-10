from fastapi import APIRouter
from app.api.vessels import router as vessels_router
from app.api.crew import router as crew_router
from app.api.voyages import router as voyages_router
from app.api.bunker import router as bunker_router
from app.api.maintenance import router as maintenance_router
from app.api.agent import router as agent_router
from app.api.rag import router as rag_router
from app.api.ais import router as ais_router
from app.api.decarbonization import router as cii_router
from app.api.chartering import router as chartering_router
from app.api.noon_reports import router as noon_reports_router
from app.api.hseq import router as hseq_router
from app.api.drydock import router as drydock_router
from app.api.weather_routing import router as weather_routing_router
from app.api.spb import router as spb_router
from app.api.cargo_stowage import router as stowage_router
from app.api.payroll import router as payroll_router
from app.api.alarms import router as alarms_router
from app.api.ballast_stability import router as ballast_stability_router

api_router = APIRouter()

api_router.include_router(vessels_router)
api_router.include_router(crew_router)
api_router.include_router(voyages_router)
api_router.include_router(bunker_router)
api_router.include_router(maintenance_router)
api_router.include_router(agent_router)
api_router.include_router(rag_router)
api_router.include_router(ais_router)
api_router.include_router(cii_router)
api_router.include_router(chartering_router)
api_router.include_router(noon_reports_router)
api_router.include_router(hseq_router)
api_router.include_router(drydock_router)
api_router.include_router(weather_routing_router)
api_router.include_router(spb_router)
api_router.include_router(stowage_router)
api_router.include_router(payroll_router)
api_router.include_router(alarms_router)
api_router.include_router(ballast_stability_router)
