from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from the local backend .env file."""

    supabase_url: str | None = None
    supabase_publishable_key: str | None = None
    frontend_origin: str = "http://localhost:5173"
    frontend_origin_regex: str | None = (
        r"^https://a2-bus4012-myetfhub-[a-z0-9-]+-ngoc-giang\.vercel\.app$"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def require_supabase(self) -> tuple[str, str]:
        """Return required Supabase settings or raise a safe configuration error."""
        if not self.supabase_url or not self.supabase_publishable_key:
            raise RuntimeError(
                "Supabase is not configured. Set SUPABASE_URL and "
                "SUPABASE_PUBLISHABLE_KEY in backend/.env."
            )
        return self.supabase_url.rstrip("/"), self.supabase_publishable_key


@lru_cache
def get_settings() -> Settings:
    return Settings()