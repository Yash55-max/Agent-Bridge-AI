import requests


def test_health():
    r = requests.get("http://localhost:8000/health")
    assert r.status_code == 200


def test_generate():
    r = requests.post("http://localhost:8000/api/v1/generate", json={"description": "smoke"})
    assert r.status_code == 200
    j = r.json()
    assert "generated_code" in j
