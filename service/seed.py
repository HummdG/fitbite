"""Dev seed — create a confirmed test user + profile + a day of food_log rows.

Uses the Supabase **service-role key** (bypasses RLS). DEV ONLY: never run this
against a production project. Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from
service/.env (same loader as the app).

Run from the service/ dir with the venv active:

    python seed.py

Idempotent: re-running reuses the same auth user, re-upserts the profile, and
resets the trailing HISTORY_DAYS of food_log rows so totals don't keep growing.
"""

from datetime import date, timedelta

from supabase import create_client

from app.config import get_settings

# ---- login details (printed at the end) -------------------------------------
EMAIL = "demo@fitbite.app"
PASSWORD = "fitbite123"

# ---- dummy profile (targets precomputed via service/app/services/targets.py:
# male / 28 / 178cm / 82kg / moderate / lose_weight) --------------------------
PROFILE = {
    "gender": "male",
    "age": 28,
    "height_cm": 178,
    "current_weight_kg": 82,
    "target_weight_kg": 75,
    "activity_level": "moderate",
    "goal": "lose_weight",
    "strictness": "balanced",
    "dietary_prefs": ["halal"],
    "allergies": [],
    "calorie_target": 2230,
    "protein_target_g": 150,
    "fibre_target_g": 31,
    "carbs_target_g": 260,
    "fat_target_g": 65,
    "dashboard_widgets": ["calories", "protein", "carbs", "fat"],
}

# ---- a day's worth of tracked food (shows on the Today tab) ------------------
TODAY_FOOD = [
    {"name": "Protein oats & berries", "calories": 350, "protein_g": 24, "fibre_g": 9, "carbs_g": 48, "fat_g": 9},
    {"name": "Grilled chicken salad", "calories": 420, "protein_g": 38, "fibre_g": 8, "carbs_g": 18, "fat_g": 22},
    {"name": "Salmon rice bowl", "calories": 610, "protein_g": 42, "fibre_g": 6, "carbs_g": 62, "fat_g": 20},
]

# ---- meal pool used to back-fill history (powers the Log calendar + Progress
# chart). Each past day rotates through three of these for variety. -----------
HISTORY_DAYS = 14
_MEALS = [
    {"name": "Greek yoghurt & granola", "calories": 330, "protein_g": 22, "fibre_g": 5, "carbs_g": 42, "fat_g": 8},
    {"name": "Veggie omelette & toast", "calories": 410, "protein_g": 26, "fibre_g": 6, "carbs_g": 30, "fat_g": 20},
    {"name": "Chicken & quinoa bowl", "calories": 560, "protein_g": 44, "fibre_g": 9, "carbs_g": 52, "fat_g": 16},
    {"name": "Turkey wrap & salad", "calories": 480, "protein_g": 35, "fibre_g": 7, "carbs_g": 45, "fat_g": 15},
    {"name": "Beef stir-fry & rice", "calories": 640, "protein_g": 40, "fibre_g": 6, "carbs_g": 68, "fat_g": 22},
    {"name": "Lentil soup & bread", "calories": 390, "protein_g": 18, "fibre_g": 12, "carbs_g": 55, "fat_g": 9},
    {"name": "Grilled salmon & greens", "calories": 520, "protein_g": 40, "fibre_g": 8, "carbs_g": 20, "fat_g": 28},
    {"name": "Cheat-day burger & fries", "calories": 980, "protein_g": 42, "fibre_g": 5, "carbs_g": 88, "fat_g": 52},
    {"name": "Protein shake & banana", "calories": 280, "protein_g": 30, "fibre_g": 4, "carbs_g": 32, "fat_g": 4},
]


def _history_rows(uid: str, today: date) -> list[dict]:
    """3 rotating meals per day for the trailing HISTORY_DAYS (excluding today)."""
    rows: list[dict] = []
    for offset in range(1, HISTORY_DAYS + 1):
        day = (today - timedelta(days=offset)).isoformat()
        for i in range(3):
            meal = _MEALS[(offset * 3 + i) % len(_MEALS)]
            rows.append({"user_id": uid, "log_date": day, **meal})
    return rows


def _get_or_create_user(client, email: str, password: str) -> str:
    """Create a confirmed auth user, or return the existing one's id."""
    try:
        res = client.auth.admin.create_user(
            {"email": email, "password": password, "email_confirm": True}
        )
        print(f"created auth user: {email}")
        return res.user.id
    except Exception as exc:  # already exists (or transient) -> look it up
        page = client.auth.admin.list_users()
        users = page if isinstance(page, list) else getattr(page, "users", page)
        for user in users:
            if (user.email or "").lower() == email.lower():
                print(f"reusing existing auth user: {email}")
                return user.id
        raise RuntimeError(f"could not create or find {email}: {exc}") from exc


def main() -> None:
    settings = get_settings()
    if not (settings.supabase_url and settings.supabase_service_role_key):
        raise SystemExit(
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in service/.env first."
        )

    client = create_client(settings.supabase_url, settings.supabase_service_role_key)

    uid = _get_or_create_user(client, EMAIL, PASSWORD)

    client.table("profiles").upsert({"id": uid, **PROFILE}).execute()
    print("upserted profile")

    today = date.today()
    earliest = (today - timedelta(days=HISTORY_DAYS)).isoformat()
    # reset the whole seeded window so re-runs don't pile up duplicate rows
    client.table("food_log").delete().eq("user_id", uid).gte("log_date", earliest).execute()

    today_rows = [{"user_id": uid, "log_date": today.isoformat(), **item} for item in TODAY_FOOD]
    history_rows = _history_rows(uid, today)
    client.table("food_log").insert(today_rows + history_rows).execute()
    print(f"inserted {len(today_rows)} rows for today + {len(history_rows)} history rows "
          f"({HISTORY_DAYS} days)")

    print("\n--- LOGIN ---")
    print(f"email:    {EMAIL}")
    print(f"password: {PASSWORD}")


if __name__ == "__main__":
    main()
