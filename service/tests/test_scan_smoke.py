"""End-to-end /scan test with Claude AND Supabase mocked (no network, no keys).

Exercises the real orchestration + scoring + response shaping, and asserts the
critical security property: the persisted scan is scoped to the JWT subject.
"""

import json
import time
from pathlib import Path

import jwt
import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from app.models.profile import StoredProfile
from app.services import extraction, persistence
from app.services.extraction import parse_tool_input

SECRET = "test-jwt-secret-do-not-use-in-prod"
USER_ID = "user-xyz-789"
FIXTURE = json.loads(
    (Path(__file__).parent / "fixtures" / "claude_extract_response.json").read_text(encoding="utf-8")
)
PROFILE = StoredProfile(
    goal="lose_weight", strictness="balanced", dietary_prefs=[], allergies=[],
    calorie_target=1600, protein_target_g=100, fibre_target_g=25,
)


@pytest.fixture(autouse=True)
def _configure(monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", SECRET)
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def client():
    return TestClient(app)


def _token(sub=USER_ID):
    return jwt.encode(
        {"sub": sub, "aud": "authenticated", "exp": int(time.time()) + 600},
        SECRET, algorithm="HS256",
    )


def test_scan_returns_ranked_recommendations(client, monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(extraction, "extract_menu", lambda req: parse_tool_input(FIXTURE))
    monkeypatch.setattr(persistence, "get_profile", lambda uid: PROFILE)

    def fake_insert(user_id, req, result, image_path=None):
        captured["user_id"] = user_id
        return "scan-abc-123"

    monkeypatch.setattr(persistence, "insert_scan", fake_insert)

    body = {
        "source": "photo",
        "restaurant_name": "Test Grill",
        "image_base64": "ZHVtbXk=",
        "consumed": {"calories": 200, "protein_g": 10, "fibre_g": 2},
    }
    r = client.post("/scan", json=body, headers={"Authorization": f"Bearer {_token()}"})
    assert r.status_code == 200
    data = r.json()

    assert data["scan_id"] == "scan-abc-123"
    assert len(data["dishes"]) == 4
    assert data["best_match"]["name"] == "Chicken shawarma bowl"
    assert data["targets_snapshot"]["calories_remaining"] == 1400  # 1600 - 200
    # critical: persisted scan is scoped to the verified JWT subject, not the body
    assert captured["user_id"] == USER_ID
    # an unreadable, wide-range dish is flagged hard_to_track
    special = next(d for d in data["dishes"] if d["name"] == "Daily chef special")
    assert special["verdict"] == "hard_to_track"


def test_scan_requires_a_completed_profile(client, monkeypatch):
    monkeypatch.setattr(extraction, "extract_menu", lambda req: [])
    monkeypatch.setattr(persistence, "get_profile", lambda uid: None)
    r = client.post("/scan", json={"source": "text", "menu_text": "x"},
                    headers={"Authorization": f"Bearer {_token()}"})
    assert r.status_code == 409


def test_scan_requires_auth(client):
    r = client.post("/scan", json={"source": "text", "menu_text": "x"})
    assert r.status_code == 401
