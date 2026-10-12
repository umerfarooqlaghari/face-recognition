from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "backend/.env"), extra="ignore")

    # Application
    PROJECT_NAME: str = "Face Recognition Attendance API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://192.168.1.100:8081",
        "*"
    ]

    # Render PostgreSQL
    DATABASE_URL: str = ""

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # Auth & Tokens
    JWT_SECRET_KEY: str = "c828d39e94bf965bead2132d91b4fc6f9d3b4e7a83f123d4e5f6a7b8c9d0e1f2"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Biometrics & Geofencing
    FACE_SIMILARITY_THRESHOLD: float = 0.68
    LIVENESS_CONFIDENCE_THRESHOLD: float = 0.75
    DEFAULT_OFFICE_RADIUS_METERS: int = 200
    MAX_IMAGE_UPLOAD_BYTES: int = 10485760

    # AWS SES (Simple Email Service)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_SES_FROM_EMAIL: str = "noreply@attendapp.com"
    FRONTEND_URL: str = "http://localhost:3000"

settings = Settings()
