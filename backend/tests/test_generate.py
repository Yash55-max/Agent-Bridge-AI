import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_generate_json():
    with TestClient(app) as client:
        r = client.post("/api/v1/generate", json={"description": "hello"})
        assert r.status_code == 200
        data = r.json()
        assert "generated_code" in data


def test_generate_form_urlencoded():
    with TestClient(app) as client:
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        r = client.post("/api/v1/generate", data={"description": "hello"}, headers=headers)
        assert r.status_code == 200
        data = r.json()
        assert "generated_code" in data


def test_generate_query_param():
    with TestClient(app) as client:
        r = client.post("/api/v1/generate?description=hello")
        assert r.status_code == 200
        data = r.json()
        assert "generated_code" in data
