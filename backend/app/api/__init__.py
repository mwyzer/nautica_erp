from fastapi import APIRouter
from app.api.vessels import router as vessels_router
from app.api.crew import router as crew_router
from app.api.voyages import router as voyages_router
from app.api.bunker import router as bunker_router
from app.api.maintenance import router as maintenance_router
from app.api.agent import router as agent_router
from app.api.rag import router as rag_router

api_router = APIRouter()

api_router.include_router(vessels_router)
api_router.include_router(crew_router)
api_router.include_router(voyages_router)
api_router.include_router(bunker_router)
api_router.include_router(maintenance_router)
api_router.include_router(agent_router)
api_router.include_router(rag_router)
