"""Thin Anthropic client wrapper. The API key is read server-side only."""

from functools import lru_cache

import anthropic

from app.config import get_settings


@lru_cache
def get_client() -> anthropic.Anthropic:
    settings = get_settings()
    if not settings.anthropic_api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")
    # The SDK retries 429/5xx automatically.
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)
