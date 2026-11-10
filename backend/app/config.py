from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nautical ERP Automation"
    VERSION: str = "1.0.0-mvp"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database Configuration (PostgreSQL by default; sqlite async supported for zero-setup demo)
    DATABASE_URL: str = "sqlite+aiosqlite:///./nautical_erp.db"
    # Example for PostgreSQL: "postgresql+asyncpg://postgres:postgres@localhost:5432/nautical_db"
    
    # AI Agent Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.8-flash"
    
    # Maritime Safety Margins
    BUNKER_SAFETY_BUFFER_PERCENT: float = 15.0  # Required + 15% reserve fuel
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
