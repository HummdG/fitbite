"""Runtime configuration, loaded from environment / .env.

Secrets default to empty strings so the module imports cleanly in tests and in
CI without a populated .env. Endpoints that genuinely need a secret validate it
at call time (see deps.get_current_user and the Claude client).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Anthropic (server-side only)
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-6"

    # Supabase (service-role + JWT secret are server-side only)
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    supabase_service_role_key: str = ""

    # CORS: comma-separated origins for the Expo dev server
    cors_origins: str = "*"

    @property
    def cors_origin_list(self) -> list[str]:
        if not self.cors_origins or self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
