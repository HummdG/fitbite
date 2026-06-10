# FitBite Service (FastAPI)

Python backend that powers FitBite's intelligence:

- **`/targets`** — compute calorie / protein / fibre targets from a profile (Mifflin-St Jeor → goal-adjusted). Pure, fast, no Claude.
- **`/scan`** — read a menu image/text with **Claude vision**, then rank dishes with a deterministic **Fit Score**.
- **`/healthz`** — liveness.

### Design boundary

> **Claude EXTRACTS, Python SCORES.** Claude turns a messy menu into structured dishes
> with macro *ranges*. It never ranks and never sees the user's targets. The weighted
> Fit Score, verdict labels and ranking live in pure, unit-tested Python (`services/scoring.py`)
> so the recommendation logic stays stable, explainable and regression-tested.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
copy .env.example .env   # then fill in real values
```

## Run

```powershell
uvicorn app.main:app --reload --port 8000
# verify: curl http://localhost:8000/healthz  ->  {"status":"ok"}
```

## Test

```powershell
pytest
```

`tests/test_targets.py` and `tests/test_scoring.py` are the regression backbone (pure logic).
`tests/test_scan_smoke.py` exercises `/scan` end-to-end with the Claude call mocked, so it
needs no API key or network.

## Environment

See [`.env.example`](.env.example). The Anthropic key, Supabase service-role key and JWT
secret are **server-side only** and must never reach the app bundle.
