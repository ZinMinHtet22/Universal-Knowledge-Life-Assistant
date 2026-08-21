from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: Optional[str] = "sqlite:///./ukla.db"
    secret_key: str = "your-super-secret-key-for-mvp-only"
    access_token_expire_minutes: int = 10080

    class Config:
        env_file = ".env"

settings = Settings()
