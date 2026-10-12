from fastapi.testclient import TestClient

from app.main import app, settings


def preflight(client: TestClient, origin: str):
    return client.options(
        "/investor-profile",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )


def test_cors_allows_configured_frontend_origin():
    with TestClient(app) as client:
        response = preflight(client, settings.frontend_origin)

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == settings.frontend_origin


def test_cors_allows_matching_vercel_preview_origin():
    origin = "https://a2-bus4012-myetfhub-3179w39p4-ngoc-giang.vercel.app"

    with TestClient(app) as client:
        response = preflight(client, origin)

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_cors_rejects_unrelated_vercel_origin():
    with TestClient(app) as client:
        response = preflight(client, "https://unrelated-project.vercel.app")

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers