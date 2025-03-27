from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "sqlite:///./bug_gpt.db"
    scan_timeout: int = 300
    max_concurrent_scans: int = 5
    report_path: str = "./reports"
    vite_api_url: str = "http://127.0.0.1:8000"
    socket_url: str = "http://127.0.0.1:8000"

    @field_validator('scan_timeout', 'max_concurrent_scans', mode="before")
    @classmethod
    def validate_int_values(cls, value):
        return int(value)

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
