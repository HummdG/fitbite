"""Dev seed — create a batch of confirmed Supabase **Auth** users (login only).

No profiles, no food_log: each user is a bare auth.users account (email confirmed)
so it can sign in immediately. Because there's no profile row, signing in routes to
onboarding — useful for testing the full sign-up / onboarding flow with fresh accounts.

Uses the Supabase **service-role key** (Admin API). DEV ONLY — never run against prod.
Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from service/.env.

Run from the service/ dir with the venv:

    python seed_users.py

Idempotent: existing accounts are left as-is (reused, not duplicated).
"""

from supabase import create_client

from app.config import get_settings

# Shared dev password for every account (>= 6 chars to satisfy the sign-up rule).
PASSWORD = "fitbite123"

# Add/remove emails here to control how many dummy users get created.
EMAILS = [
    "alice@fitbite.test",
    "bob@fitbite.test",
    "carol@fitbite.test",
    "dave@fitbite.test",
    "erin@fitbite.test",
]


def _get_or_create_user(client, email: str, password: str) -> tuple[str, bool]:
    """Create a confirmed auth user; return (id, created). Reuse if it exists."""
    try:
        res = client.auth.admin.create_user(
            {"email": email, "password": password, "email_confirm": True}
        )
        return res.user.id, True
    except Exception:  # already exists (or transient) -> look it up
        page = client.auth.admin.list_users()
        users = page if isinstance(page, list) else getattr(page, "users", page)
        for user in users:
            if (user.email or "").lower() == email.lower():
                return user.id, False
        raise


def main() -> None:
    settings = get_settings()
    if not (settings.supabase_url and settings.supabase_service_role_key):
        raise SystemExit(
            "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in service/.env first."
        )

    client = create_client(settings.supabase_url, settings.supabase_service_role_key)

    print(f"seeding {len(EMAILS)} auth users (password: {PASSWORD})\n")
    for email in EMAILS:
        _, created = _get_or_create_user(client, email, PASSWORD)
        print(f"  {'created ' if created else 'exists  '} {email}")

    print("\nAll accounts use the same password:", PASSWORD)


if __name__ == "__main__":
    main()
