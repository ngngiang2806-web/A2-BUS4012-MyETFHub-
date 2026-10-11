VALID_PROFILE = {
    "email_address": "user.one@example.com",
    "full_name": "Jane Doe",
    "investment_goal": "capital-growth",
    "risk_preference": "moderate",
    "investment_timeframe": "long-term",
}


def test_profile_can_be_created_and_retrieved(authenticated_client):
    client, _, _ = authenticated_client

    created = client.post("/investor-profile", json=VALID_PROFILE)
    retrieved = client.get("/investor-profile")

    assert created.status_code == 201
    assert created.json()["email_address"] == VALID_PROFILE["email_address"]
    assert retrieved.status_code == 200
    assert retrieved.json()["full_name"] == "Jane Doe"


def test_profile_missing_required_field_is_rejected(authenticated_client):
    client, _, _ = authenticated_client
    invalid = {key: value for key, value in VALID_PROFILE.items() if key != "full_name"}

    response = client.post("/investor-profile", json=invalid)

    assert response.status_code == 422


def test_profile_rejects_frontend_incompatible_choice(authenticated_client):
    client, _, _ = authenticated_client
    invalid = {**VALID_PROFILE, "investment_goal": "growth"}

    response = client.post("/investor-profile", json=invalid)

    assert response.status_code == 422


def test_profile_email_must_match_authenticated_user(authenticated_client):
    client, _, _ = authenticated_client

    response = client.post(
        "/investor-profile",
        json={**VALID_PROFILE, "email_address": "another.user@example.com"},
    )

    assert response.status_code == 400


def test_profile_stores_verified_email_from_authenticated_user(authenticated_client):
    client, _, _ = authenticated_client

    response = client.post(
        "/investor-profile",
        json={**VALID_PROFILE, "email_address": "USER.ONE@EXAMPLE.COM"},
    )

    assert response.status_code == 201
    assert response.json()["email_address"] == "user.one@example.com"


def test_profile_can_be_updated(authenticated_client):
    client, _, _ = authenticated_client
    client.post("/investor-profile", json=VALID_PROFILE)

    response = client.put("/investor-profile", json={"risk_preference": "aggressive"})

    assert response.status_code == 200
    assert response.json()["risk_preference"] == "aggressive"


def test_profile_request_requires_authentication(unauthenticated_client):
    response = unauthenticated_client.get("/investor-profile")

    assert response.status_code == 401