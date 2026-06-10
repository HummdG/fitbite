"""Request dependencies — chiefly verifying the Supabase access token.

Supabase signs user access tokens with the project JWT secret (HS256). We verify
LOCALLY (no round-trip to Supabase) using that secret. If your project uses
asymmetric (ES256) signing keys instead, swap this for JWKS fetch+cache.
"""

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.config import get_settings

_bearer = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: str
    email: str | None = None


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    if creds is None or not creds.credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    settings = get_settings()
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "Server auth is not configured"
        )

    try:
        payload = jwt.decode(
            creds.credentials,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token missing subject")

    return CurrentUser(id=sub, email=payload.get("email"))
