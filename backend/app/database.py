from typing import Any

import httpx
from fastapi import Depends, HTTPException, status

from app.auth import AuthenticatedUser, get_authenticated_user
from app.config import get_settings


class SupabaseDatabaseError(Exception):
    """A safe wrapper for a failed request to Supabase's REST interface."""


class SupabaseRepository:
    """RLS-aware database operations performed as the authenticated user."""

    def __init__(self, user: AuthenticatedUser) -> None:
        self.user = user
        self.supabase_url, self.publishable_key = get_settings().require_supabase()

    @property
    def _headers(self) -> dict[str, str]:
        return {
            "apikey": self.publishable_key,
            "Authorization": f"Bearer {self.user.access_token}",
            "Content-Type": "application/json",
        }

    async def _request(
        self,
        method: str,
        table: str,
        *,
        params: dict[str, str] | None = None,
        json: Any = None,
        prefer: str | None = None,
    ) -> list[dict[str, Any]]:
        headers = self._headers
        if prefer:
            headers["Prefer"] = prefer

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.request(
                    method,
                    f"{self.supabase_url}/rest/v1/{table}",
                    headers=headers,
                    params=params,
                    json=json,
                )
        except httpx.HTTPError as error:
            raise SupabaseDatabaseError("The database service is unavailable.") from error

        if response.is_error:
            raise SupabaseDatabaseError("The database request was rejected.")

        if not response.content:
            return []
        data = response.json()
        return data if isinstance(data, list) else [data]

    async def get_profile(self) -> dict[str, Any] | None:
        rows = await self._request(
            "GET",
            "investor_profiles",
            params={
                "select": "id,user_id,email_address,full_name,investment_goal,risk_preference,investment_timeframe,created_at,updated_at",
                "user_id": f"eq.{self.user.user_id}",
                "limit": "1",
            },
        )
        return rows[0] if rows else None

    async def upsert_profile(self, profile: dict[str, Any]) -> dict[str, Any]:
        rows = await self._request(
            "POST",
            "investor_profiles",
            params={"on_conflict": "user_id"},
            json={"user_id": self.user.user_id, **profile},
            prefer="resolution=merge-duplicates,return=representation",
        )
        if not rows:
            raise SupabaseDatabaseError("The profile could not be saved.")
        return rows[0]

    async def update_profile(self, profile: dict[str, Any]) -> dict[str, Any] | None:
        rows = await self._request(
            "PATCH",
            "investor_profiles",
            params={"user_id": f"eq.{self.user.user_id}"},
            json=profile,
            prefer="return=representation",
        )
        return rows[0] if rows else None

    async def create_holding(self, holding: dict[str, Any]) -> dict[str, Any]:
        rows = await self._request(
            "POST",
            "etf_holdings",
            json={"user_id": self.user.user_id, **holding},
            prefer="return=representation",
        )
        if not rows:
            raise SupabaseDatabaseError("The holding could not be saved.")
        return rows[0]

    async def list_holdings(self) -> list[dict[str, Any]]:
        return await self._request(
            "GET",
            "etf_holdings",
            params={
                "select": "holding_id,user_id,ticker,units,purchase_price,purchase_date,created_at,updated_at",
                "user_id": f"eq.{self.user.user_id}",
                "order": "purchase_date.desc,created_at.desc",
            },
        )

    async def get_holding(self, holding_id: str) -> dict[str, Any] | None:
        rows = await self._request(
            "GET",
            "etf_holdings",
            params={
                "select": "holding_id,user_id,ticker,units,purchase_price,purchase_date,created_at,updated_at",
                "holding_id": f"eq.{holding_id}",
                "user_id": f"eq.{self.user.user_id}",
                "limit": "1",
            },
        )
        return rows[0] if rows else None

    async def update_holding(self, holding_id: str, holding: dict[str, Any]) -> dict[str, Any] | None:
        rows = await self._request(
            "PATCH",
            "etf_holdings",
            params={
                "holding_id": f"eq.{holding_id}",
                "user_id": f"eq.{self.user.user_id}",
            },
            json=holding,
            prefer="return=representation",
        )
        return rows[0] if rows else None

    async def delete_holding(self, holding_id: str) -> bool:
        rows = await self._request(
            "DELETE",
            "etf_holdings",
            params={
                "holding_id": f"eq.{holding_id}",
                "user_id": f"eq.{self.user.user_id}",
            },
            prefer="return=representation",
        )
        return bool(rows)


async def get_repository(
    user: AuthenticatedUser = Depends(get_authenticated_user),
) -> SupabaseRepository:
    try:
        return SupabaseRepository(user)
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database access is not configured on this server.",
        ) from error


def raise_database_error(error: SupabaseDatabaseError) -> None:
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="The database could not complete the request. Please try again.",
    ) from error