import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import engine, Base
from app.api import api_router
from app.services.scheduler import automation_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start autonomous background automation watcher
    await automation_scheduler.start()
    yield
    # Cleanup on shutdown
    await automation_scheduler.stop()
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "### Automated Nautical ERP Backend & AI Maritime Superintendent\n\n"
        "Specialized ERP engine for modern shipping operations, including:\n"
        "- **Vessel & Fleet Registry** (IMO, DWT, Flag, Speed & Burn Rates)\n"
        "- **Crew & STCW Compliance Engine** (Seafarer certification validity checks)\n"
        "- **Voyage Planning & Scheduling** (Nautical miles, ETD/ETA)\n"
        "- **Bunker Logs & AI Anomaly Detection** (Over-consumption alerts)\n"
        "- **PMS Maintenance System** (Defect tracking & seaworthiness validation)\n"
        "- **AI Port Clearance Agent** (Automated multi-factor voyage readiness audits using Gemini 3.8 Flash)\n"
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static assets from React dist if available
react_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(os.path.join(react_dist_path, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(react_dist_path, "assets")), name="react-assets")

# Include API Routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/dashboard", tags=["Frontend"])
async def serve_dashboard():
    """Serves the Maritime Operations Command Center React SPA."""
    react_index = os.path.join(react_dist_path, "index.html")
    if os.path.exists(react_index):
        return FileResponse(react_index)
    return {
        "message": "React frontend is running in dev mode on port 5173. Visit http://localhost:5173",
        "frontend_dev_url": "http://localhost:5173",
        "api_docs_url": "/docs"
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "dashboard_ui": "/dashboard",
        "endpoints": {
            "vessels": f"{settings.API_V1_PREFIX}/vessels",
            "crew": f"{settings.API_V1_PREFIX}/crew",
            "voyages": f"{settings.API_V1_PREFIX}/voyages",
            "bunker": f"{settings.API_V1_PREFIX}/bunker",
            "maintenance": f"{settings.API_V1_PREFIX}/maintenance",
            "ai_agent_audit": f"{settings.API_V1_PREFIX}/agent/audit-voyage/{{voyage_id}}",
            "ai_copilot_chat": f"{settings.API_V1_PREFIX}/agent/chat",
        }
    }


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "service": "nautical-erp-core"}
