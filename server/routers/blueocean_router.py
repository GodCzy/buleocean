from __future__ import annotations

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from server.services.blueocean_service import blueocean_service

blueocean = APIRouter(prefix="/blueocean", tags=["BlueOcean"])


class BlueOceanQuestionRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=800, description="症状、环境或用药相关问题")
    host: str | None = Field(default=None, max_length=80, description="宿主或养殖对象")
    top_k: int = Field(default=5, ge=1, le=8, description="返回证据数量")


@blueocean.get("/health")
async def health_check():
    return {
        "success": True,
        "data": {
            "service": "blueocean-backend",
            "status": "ok",
            "capabilities": ["overview", "graph", "rag", "retrieval", "alerts"],
        },
    }


@blueocean.get("/overview")
async def get_overview():
    return {"success": True, "data": blueocean_service.overview()}


@blueocean.get("/graph")
async def get_graph(focus: str | None = Query(default=None, max_length=120)):
    return {"success": True, "data": blueocean_service.graph(focus=focus)}


@blueocean.post("/ask")
async def ask_question(payload: BlueOceanQuestionRequest):
    answer = blueocean_service.ask(question=payload.question, host=payload.host, top_k=payload.top_k)
    return {"success": True, "data": answer}


@blueocean.get("/retrieval")
async def get_retrieval(query: str | None = Query(default=None, max_length=200)):
    return {"success": True, "data": blueocean_service.retrieval(query=query)}


@blueocean.get("/alerts")
async def get_alerts():
    return {"success": True, "data": blueocean_service.alerts()}
