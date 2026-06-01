from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_env_file() -> str:
    """Search upward from this file for a `.env` file and return its path.

    This helps when running the backend with a working directory of `backend/` so
    the project's root `.env` (workspace root) is still discovered.
    """
    here = Path(__file__).resolve()
    # check up to 4 parent levels (core -> app -> backend -> workspace)
    for i in range(4):
        candidate = here.parents[i] / ".env"
        if candidate.exists():
            return str(candidate)
    return ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_find_env_file(), extra="ignore", enable_decoding=False)

    app_name: str = "AgentBridge AI API"
    app_version: str = "0.1.0"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"], validation_alias="CORS_ORIGINS")
    # Groq API (alternative LLM provider)
    groq_api_key: str | None = Field(default=None, validation_alias="GROQ_API_KEY")
    groq_api_url: str | None = Field(default=None, validation_alias="GROQ_API_URL")
    groq_model: str = Field(default="llama-3.1-8b-instant", validation_alias="GROQ_MODEL")
    llm_provider: str = Field(default="groq", validation_alias="LLM_PROVIDER")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value):
        if value is None:
            return ["http://localhost:3000"]
        if isinstance(value, str):
            items = [item.strip() for item in value.split(",") if item.strip()]
            return items or ["http://localhost:3000"]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
