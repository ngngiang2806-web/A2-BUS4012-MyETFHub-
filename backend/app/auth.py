from dataclasses import dataclass

import httpx
from fastapi import Header, HTTPException, status

from app.config import get_settings


@dataclass(frozen=True)
class AuthenticatedUser:
    """The identity returned by Supabase Auth after token verification."""

    user_id: str
    email: str
    access_token: str


async def get_authenticated_user(
    authorization: str | None = Header(default=None),
) -> AuthenticatedUser:
    """Verify a Supabase bearer token and return its trusted user identity."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A valid Supabase access token is required.",
        )

    access_token = authorization.removeprefix("Bearer ").strip()
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A valid Supabase access token is required.",
        )

    try:
        supabase_url, publishable_key = get_settings().require_supabase()
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured on this server.",
        ) from error

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{supabase_url}/auth/v1/user",
                headers={
                    "apikey": publishable_key,
                    "Authorization": f"Bearer {access_token}",
                },
            )
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable.",
        ) from error

    if response.status_code in {401, 403}:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The Supabase access token is invalid or expired.",
        )
    if response.is_error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable.",
        )

    data = response.json()
    user_id = data.get("id")
    email = data.get("email")
    if not isinstance(user_id, str) or not isinstance(email, str) or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The authenticated account does not have a usable email address.",
        )

    return AuthenticatedUser(user_id=user_id, email=email, access_token=access_token)