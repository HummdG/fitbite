"""Supabase access using the service-role key.

SECURITY: the service-role key BYPASSES row-level security. Every write here must
set user_id from the verified JWT subject (see routers/scan.py) — never from the
request body. These functions are monkeypatched in tests (no network needed).
"""

from functools import lru_cache
from typing import Optional

from supabase import Client, create_client

from app.config import get_settings
from app.models.profile import StoredProfile
from app.models.scan import ScanRequest, ScanResult

_PROFILE_COLUMNS = (
    "goal,strictness,dietary_prefs,allergies,"
    "calorie_target,protein_target_g,fibre_target_g,carbs_target_g,fat_target_g"
)


@lru_cache
def _client() -> Client:
    settings = get_settings()
    if not (settings.supabase_url and settings.supabase_service_role_key):
        raise RuntimeError("Supabase service credentials are not configured")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_profile(user_id: str) -> Optional[StoredProfile]:
    resp = (
        _client().table("profiles").select(_PROFILE_COLUMNS)
        .eq("id", user_id).maybe_single().execute()
    )
    if not resp or not resp.data:
        return None
    return StoredProfile.model_validate(resp.data)


def insert_scan(
    user_id: str,
    req: ScanRequest,
    result: ScanResult,
    image_path: Optional[str] = None,
) -> str:
    row = {
        "user_id": user_id,  # ALWAYS the verified JWT subject
        "restaurant_name": req.restaurant_name,
        "source": req.source,
        "image_path": image_path,
        "result": result.model_dump(mode="json"),
    }
    resp = _client().table("scans").insert(row).execute()
    return resp.data[0]["id"]
