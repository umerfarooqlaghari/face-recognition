from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import List, Union, Optional, Any
import json

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "backend/.env"), extra="ignore")

    # Application
    PROJECT_NAME: str = "Face Recognition Attendance API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_CORS_ORIGINS: Union[List[str], str] = "*"
    CORS_ORIGINS: Optional[Union[List[str], str]] = None

    @staticmethod
    def _parse_origins(val: Any) -> List[str]:
        if not val:
            return ["*"]
        if isinstance(val, str):
            v_stripped = val.strip()
            if not v_stripped:
                return ["*"]
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                try:
                    parsed = json.loads(v_stripped)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            # Split comma-separated string
            return [i.strip() for i in v_stripped.split(",") if i.strip()]
        elif isinstance(val, (list, tuple)):
            return [str(i).strip() for i in val if str(i).strip()]
        return ["*"]

    @model_validator(mode="after")
    def resolve_cors(self) -> "Settings":
        # Check CORS_ORIGINS first (from docker-compose / render), then ALLOWED_CORS_ORIGINS
        raw_val = self.CORS_ORIGINS if self.CORS_ORIGINS is not None else self.ALLOWED_CORS_ORIGINS
        self.ALLOWED_CORS_ORIGINS = self._parse_origins(raw_val)
        return self

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

    # Stripe SaaS Billing & Webhook ($2/employee/month + 14-day trial)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID: str = ""

settings = Settings()
