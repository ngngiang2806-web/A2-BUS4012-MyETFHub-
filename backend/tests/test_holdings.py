from app.auth import AuthenticatedUser
from tests.conftest import FakeRepository, USER_TWO_ID

VALID_HOLDING = {
    "ticker": "vas",
    "units": "10",
    "purchase_price": "109.33",
    "purchase_date": "2026-10-01",
}


def create_holding(client):
    response = client.post("/etf-holdings", json=VALID_HOLDING)
    assert response.status_code == 201
    return response.json()


def test_holding_can_be_created_and_listed(authenticated_client):
    client, _, _ = authenticated_client

    created = create_holding(client)
    listed = client.get("/etf-holdings")

    assert created["ticker"] == "VAS"
    assert listed.status_code == 200
    assert len(listed.json()) == 1
    assert listed.json()[0]["holding_id"] == created["holding_id"]


def test_holding_rejects_zero_or_negative_units(authenticated_client):
    client, _, _ = authenticated_client

    zero = client.post("/etf-holdings", json={**VALID_HOLDING, "units": "0"})
    negative = client.post("/etf-holdings", json={**VALID_HOLDING, "units": "-1"})

    assert zero.status_code == 422
    assert negative.status_code == 422


def test_holding_rejects_negative_price_and_missing_ticker(authenticated_client):
    client, _, _ = authenticated_client

    negative_price = client.post("/etf-holdings", json={**VALID_HOLDING, "purchase_price": "-0.01"})
    missing_ticker = client.post("/etf-holdings", json={key: value for key, value in VALID_HOLDING.items() if key != "ticker"})

    assert negative_price.status_code == 422
    assert missing_ticker.status_code == 422


def test_invalid_holding_id_is_rejected(authenticated_client):
    client, _, _ = authenticated_client

    response = client.get("/etf-holdings/not-a-uuid")

    assert response.status_code == 422


def test_nonexistent_holding_update_and_delete_return_not_found(authenticated_client):
    client, _, _ = authenticated_client
    missing_id = "00000000-0000-0000-0000-000000000001"

    update = client.put(f"/etf-holdings/{missing_id}", json={"units": "12"})
    delete = client.delete(f"/etf-holdings/{missing_id}")

    assert update.status_code == 404
    assert delete.status_code == 404


def test_holding_can_be_updated_and_deleted(authenticated_client):
    client, _, _ = authenticated_client
    created = create_holding(client)

    updated = client.put(
        f"/etf-holdings/{created['holding_id']}",
        json={"ticker": "vgs", "units": "5.5"},
    )
    deleted = client.delete(f"/etf-holdings/{created['holding_id']}")
    listed = client.get("/etf-holdings")

    assert updated.status_code == 200
    assert updated.json()["ticker"] == "VGS"
    assert deleted.status_code == 200
    assert listed.json() == []


def test_user_cannot_access_another_users_holding(authenticated_client):
    client, store, _ = authenticated_client
    holding = create_holding(client)
    second_user = AuthenticatedUser(
        user_id=str(USER_TWO_ID),
        email="user.two@example.com",
        access_token="second-mock-token",
    )

    # This emulates RLS plus user-scoped WHERE clauses: the same shared store is visible,
    # but the repository returns only rows owned by the current authenticated user.
    second_repository = FakeRepository(second_user, store)

    import asyncio

    assert asyncio.run(second_repository.get_holding(holding["holding_id"])) is None
    assert asyncio.run(second_repository.delete_holding(holding["holding_id"])) is False