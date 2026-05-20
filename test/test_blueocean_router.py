from __future__ import annotations

import importlib.util
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient


def _load_blueocean_router():
    router_path = Path(__file__).resolve().parents[1] / "server" / "routers" / "blueocean_router.py"
    spec = importlib.util.spec_from_file_location("blueocean_router_under_test", router_path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.blueocean


blueocean = _load_blueocean_router()


def _client() -> TestClient:
    app = FastAPI()
    app.include_router(blueocean, prefix="/api")
    return TestClient(app)


def test_blueocean_health():
    response = _client().get("/api/blueocean/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] == "ok"
    assert "rag" in payload["data"]["capabilities"]


def test_blueocean_overview_contains_project_metrics():
    response = _client().get("/api/blueocean/overview")

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["project"]["name"] == "蓝海智询"
    assert data["metrics"]["entity_nodes"] > 0
    assert any(module["id"] == "graph" for module in data["modules"])


def test_blueocean_graph_returns_nodes_edges_and_selected_path():
    response = _client().get("/api/blueocean/graph")

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["graph_id"] == "blueocean-disease-drug-env"
    assert len(data["nodes"]) >= 10
    assert len(data["edges"]) >= 10
    assert "候选病害" not in data["selected_path"]
    assert data["selected_path"]["candidate_diseases"]


def test_blueocean_ask_returns_grounded_answer():
    response = _client().post(
        "/api/blueocean/ask",
        json={
            "question": "石斑鱼体表摩擦、鳃丝发白，最近氨氮升高，应该优先怀疑什么？",
            "host": "石斑鱼",
            "top_k": 3,
        },
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert "刺激隐核虫" in data["answer"]
    assert data["triage"]["level"] == "中高风险"
    assert len(data["evidence"]) == 3
    assert data["query_plan"]


def test_blueocean_retrieval_and_alerts_are_available():
    client = _client()

    retrieval = client.get("/api/blueocean/retrieval", params={"query": "弧菌感染 氨氮"})
    assert retrieval.status_code == 200
    retrieval_data = retrieval.json()["data"]
    assert retrieval_data["collections"]
    assert retrieval_data["evaluation"]["recall_at_5"] > 0
    assert retrieval_data["query_replay"]

    alerts = client.get("/api/blueocean/alerts")
    assert alerts.status_code == 200
    alerts_data = alerts.json()["data"]
    assert alerts_data["summary"]["risk_level"] == "中高风险"
    assert any(signal["name"] == "氨氮" for signal in alerts_data["signals"])
