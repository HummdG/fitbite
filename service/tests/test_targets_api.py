"""API tests for /targets — focused on the Supabase-JWT auth gate."""

import time

import jwt
import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app

SECRET = "test-jwt-secret-do-not-use-in-prod"

VALID_BODY = dict(
    gender="male", age=30, height_cm=180, current_weight_kg=80,
    activity_level="moderate", goal="lose_weight",
)


@pytest.fixture(autouse=True)
def _configure_secret(monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", SECRET)
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def client():
    return TestClient(app)


def _token(*, sub="user-123", email="a@example.com", aud="authenticated", ttl=3600):
    payload = {"sub": sub, "email": email, "aud": aud, "exp": int(time.time()) + ttl}
    return jwt.encode(payload, SECRET, algorithm="HS256")


def test_targets_requires_a_token(client):
    r = client.post("/targets", json=VALID_BODY)
    assert r.status_code == 401


def test_targets_rejects_garbage_token(client):
    r = client.post("/targets", json=VALID_BODY,
                    headers={"Authorization": "Bearer not-a-real-jwt"})
    assert r.status_code == 401


def test_targets_rejects_expired_token(client):
    r = client.post("/targets", json=VALID_BODY,
                    headers={"Authorization": f"Bearer {_token(ttl=-10)}"})
    assert r.status_code == 401


def test_targets_rejects_token_signed_with_wrong_secret(client):
    bad = jwt.encode(
        {"sub": "u", "aud": "authenticated", "exp": int(time.time()) + 60},
        "the-wrong-secret", algorithm="HS256",
    )
    r = client.post("/targets", json=VALID_BODY,
                    headers={"Authorization": f"Bearer {bad}"})
    assert r.status_code == 401


def test_targets_happy_path_returns_computed_numbers(client):
    r = client.post("/targets", json=VALID_BODY,
                    headers={"Authorization": f"Bearer {_token()}"})
    assert r.status_code == 200
    body = r.json()
    # same male/moderate/lose_weight case verified in test_targets.py
    assert body["bmr"] == 1780
    assert body["tdee"] == 2759
    assert body["calorie_target"] == 2210
    assert body["protein_target_g"] == 145
    assert body["fibre_target_g"] == 31
    assert body["carbs_target_g"] == 260
    assert body["fat_target_g"] == 65
