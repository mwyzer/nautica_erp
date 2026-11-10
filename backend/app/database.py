import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


# Normalize database URL to ensure absolute path for SQLite
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Resolve relative sqlite paths (e.g. sqlite+aiosqlite:///./nautical_erp.db)
    if "///." in db_url:
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        db_filename = db_url.split("///.")[1].lstrip("/\\")
        abs_db_path = os.path.join(backend_dir, db_filename)
        db_url = f"sqlite+aiosqlite:///{abs_db_path}"

engine = create_async_engine(
    db_url,
    echo=False,
    connect_args=connect_args,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """FastAPI Dependency for database session management."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
