from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_env_file() -> str:
    here = Path(__file__).resolve()
    for i in range(4):
        candidate = here.parents[i] / ".env"
        if candidate.exists():
            return str(candidate)
    return ".env"


class Settings(BaseSettings):
    app_name: str = "AgentBridge API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/agentbridge"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    # Groq API (LLM provider)
    groq_api_key: str | None = Field(default=None, validation_alias="GROQ_API_KEY")
    groq_api_url: str | None = Field(default=None, validation_alias="GROQ_API_URL")
    groq_model: str = Field(default="llama-3.1-8b-instant", validation_alias="GROQ_MODEL")
    llm_provider: str = Field(default="groq", validation_alias="LLM_PROVIDER")

    model_config = SettingsConfigDict(env_file=_find_env_file(), env_file_encoding="utf-8", extra="ignore")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
