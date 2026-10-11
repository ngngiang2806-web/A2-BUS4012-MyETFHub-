from copy import deepcopy
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient

from app.auth import AuthenticatedUser, get_authenticated_user
from app.database import get_repository
from app.main import app

USER_ONE_ID = uuid4()
USER_TWO_ID = uuid4()


def timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


class FakeRepository:
    """In-memory replacement for Supabase used by mocked API tests."""

    def __init__(self, user: AuthenticatedUser, store: dict) -> None:
        self.user = user
        self.store = store

    async def get_profile(self):
        profile = self.store["profiles"].get(self.user.user_id)
        return deepcopy(profile) if profile else None

    async def upsert_profile(self, profile):
        existing = self.store["profiles"].get(self.user.user_id)
        now = timestamp()
        row = {
            "id": existing["id"] if existing else str(uuid4()),
            "user_id": self.user.user_id,
            "created_at": existing["created_at"] if existing else now,
            "updated_at": now,
            **profile,
        }
        self.store["profiles"][self.user.user_id] = row
        return deepcopy(row)

    async def update_profile(self, profile):
        existing = self.store["profiles"].get(self.user.user_id)
        if not existing:
            return None
        existing.update(profile)
        existing["updated_at"] = timestamp()
        return deepcopy(existing)

    async def create_holding(self, holding):
        now = timestamp()
        row = {
            "holding_id": str(uuid4()),
            "user_id": self.user.user_id,
            "created_at": now,
            "updated_at": now,
            **holding,
        }
        self.store["holdings"][row["holding_id"]] = row
        return deepcopy(row)

    async def list_holdings(self):
        return [
            deepcopy(holding)
            for holding in self.store["holdings"].values()
            if holding["user_id"] == self.user.user_id
        ]

    async def get_holding(self, holding_id):
        holding = self.store["holdings"].get(holding_id)
        if not holding or holding["user_id"] != self.user.user_id:
            return None
        return deepcopy(holding)

    async def update_holding(self, holding_id, holding):
        existing = await self.get_holding(holding_id)
        if not existing:
            return None
        self.store["holdings"][holding_id].update(holding)
        self.store["holdings"][holding_id]["updated_at"] = timestamp()
        return deepcopy(self.store["holdings"][holding_id])

    async def delete_holding(self, holding_id):
        holding = await self.get_holding(holding_id)
        if not holding:
            return False
        del self.store["holdings"][holding_id]
        return True


@pytest.fixture
def authenticated_client():
    store = {"profiles": {}, "holdings": {}}
    current_user = AuthenticatedUser(
        user_id=str(USER_ONE_ID),
        email="user.one@example.com",
        access_token="mock-token",
    )

    async def override_user():
        return current_user

    async def override_repository():
        return FakeRepository(current_user, store)

    app.dependency_overrides[get_authenticated_user] = override_user
    app.dependency_overrides[get_repository] = override_repository
    with TestClient(app) as test_client:
        yield test_client, store, current_user
    app.dependency_overrides.clear()


@pytest.fixture
def unauthenticated_client():
    app.dependency_overrides.clear()
    with TestClient(app) as test_client:
        yield test_client