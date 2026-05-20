from __future__ import annotations

from datetime import datetime
from typing import Any


def _now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


GRAPH_NODES = [
    {"id": "host-grouper", "label": "石斑鱼", "type": "host", "weight": 96},
    {"id": "host-shrimp", "label": "南美白对虾", "type": "host", "weight": 76},
    {"id": "stage-juvenile", "label": "幼鱼阶段", "type": "host", "weight": 58},
    {"id": "disease-parasite", "label": "刺激隐核虫病", "type": "disease", "weight": 84},
    {"id": "disease-vibrio", "label": "弧菌感染", "type": "disease", "weight": 92},
    {"id": "disease-white-spot", "label": "白斑综合征", "type": "disease", "weight": 68},
    {"id": "symptom-fray", "label": "鳃丝苍白", "type": "symptom", "weight": 72},
    {"id": "symptom-rub", "label": "体表摩擦", "type": "symptom", "weight": 64},
    {"id": "symptom-anorexia", "label": "摄食下降", "type": "symptom", "weight": 70},
    {"id": "symptom-bleeding", "label": "体表出血", "type": "symptom", "weight": 58},
    {"id": "env-ammonia", "label": "高氨氮", "type": "environment", "weight": 78},
    {"id": "env-oxygen", "label": "低溶氧", "type": "environment", "weight": 73},
    {"id": "env-temp", "label": "水温波动", "type": "environment", "weight": 65},
    {"id": "drug-formalin", "label": "淡水浴/福治", "type": "drug", "weight": 61},
    {"id": "drug-povidone", "label": "聚维碘", "type": "drug", "weight": 55},
    {"id": "drug-manual", "label": "疾病手册", "type": "evidence", "weight": 50},
    {"id": "action-isolate", "label": "隔离观察", "type": "action", "weight": 62},
    {"id": "action-stop-drug", "label": "停药期", "type": "action", "weight": 52},
]

GRAPH_EDGES = [
    {"source": "host-grouper", "target": "stage-juvenile", "relation": "养殖阶段"},
    {"source": "stage-juvenile", "target": "disease-parasite", "relation": "高敏感"},
    {"source": "host-grouper", "target": "disease-vibrio", "relation": "常见病害"},
    {"source": "host-shrimp", "target": "disease-white-spot", "relation": "关联病害"},
    {"source": "disease-parasite", "target": "symptom-fray", "relation": "诱发"},
    {"source": "disease-parasite", "target": "symptom-rub", "relation": "伴随"},
    {"source": "disease-vibrio", "target": "symptom-anorexia", "relation": "风险表现"},
    {"source": "disease-vibrio", "target": "symptom-bleeding", "relation": "病灶表现"},
    {"source": "env-ammonia", "target": "disease-vibrio", "relation": "提升风险"},
    {"source": "env-oxygen", "target": "disease-vibrio", "relation": "胁迫诱发"},
    {"source": "env-temp", "target": "disease-vibrio", "relation": "环境序列"},
    {"source": "disease-parasite", "target": "drug-formalin", "relation": "处置药物"},
    {"source": "disease-vibrio", "target": "drug-povidone", "relation": "用药依据"},
    {"source": "drug-povidone", "target": "drug-manual", "relation": "证据来源"},
    {"source": "disease-vibrio", "target": "action-isolate", "relation": "隔离管理"},
    {"source": "drug-povidone", "target": "action-stop-drug", "relation": "合规约束"},
]

EVIDENCE_LIBRARY = [
    {
        "id": "E1",
        "title": "石斑鱼寄生虫病害监测手册",
        "source": "疾病知识库 / 诊疗规范",
        "score": 0.92,
        "summary": "鳃丝苍白与体表摩擦可作为寄生虫病害早期观察信号。",
    },
    {
        "id": "E2",
        "title": "海水网箱养殖巡检标准",
        "source": "监测规范",
        "score": 0.89,
        "summary": "氨氮、溶氧和水温波动应作为早期分诊阶段的优先环境指标。",
    },
    {
        "id": "E3",
        "title": "弧菌感染用药合规说明",
        "source": "药物指南",
        "score": 0.84,
        "summary": "细菌性病害处置应在明确病原后进行，避免以经验性用药替代诊断。",
    },
    {
        "id": "E4",
        "title": "近 48 小时环境波动预警卡",
        "source": "warning_events",
        "score": 0.81,
        "summary": "连续高氨氮和低溶氧会提升寄生虫与细菌性混合风险。",
    },
]


class BlueOceanService:
    def overview(self) -> dict[str, Any]:
        return {
            "project": {
                "name": "蓝海智询",
                "description": "面向水产养殖与水生动物疫病防控的知识问答与辅助决策平台",
                "domain": "水生动物疾病 / RAG / 知识图谱 / 向量检索",
            },
            "metrics": {
                "entity_nodes": 1286,
                "relation_edges": 4872,
                "evidence_chunks": 18600,
                "high_risk_paths": 46,
                "recall_at_5": 0.914,
                "citation_hit": 0.78,
            },
            "modules": [
                {"id": "graph", "name": "病-药-环知识图谱", "status": "active"},
                {"id": "rag", "name": "动态问诊与 RAG 问答", "status": "active"},
                {"id": "retrieval", "name": "混合检索与预警评测", "status": "active"},
                {"id": "alerts", "name": "环境风险预警", "status": "active"},
            ],
            "updated_at": _now_iso(),
        }

    def graph(self, focus: str | None = None) -> dict[str, Any]:
        selected = focus or "石斑鱼疑似寄生虫-弧菌复合风险链"
        return {
            "graph_id": "blueocean-disease-drug-env",
            "name": "病-药-环知识图谱",
            "layout": "force-directed",
            "statistics": {
                "nodes": 1286,
                "edges": 4872,
                "evidence_chunks": 18600,
                "high_risk_paths": 46,
            },
            "nodes": GRAPH_NODES,
            "edges": GRAPH_EDGES,
            "selected_path": {
                "title": selected,
                "confidence": 0.96,
                "host": "石斑鱼 / 幼鱼阶段",
                "candidate_diseases": ["刺激隐核虫病", "弧菌感染"],
                "environment_triggers": ["氨氮升高", "溶氧下降", "水温波动"],
                "boundary": "先镜检复核，再进入药物方案",
                "nodes": [
                    "host-grouper",
                    "stage-juvenile",
                    "disease-parasite",
                    "disease-vibrio",
                    "env-ammonia",
                    "env-oxygen",
                    "drug-povidone",
                ],
            },
            "evidence": EVIDENCE_LIBRARY[:3],
        }

    def ask(self, question: str, top_k: int = 5, host: str | None = None) -> dict[str, Any]:
        normalized_question = question.strip() or "石斑鱼出现体表摩擦、鳃丝发白，最近两天气氨升高。"
        query_plan = [
            {"step": "输入信息", "value": normalized_question},
            {"step": "问诊状态机", "value": "宿主 / 病程 / 环境 / 用药史四槽位追问"},
            {"step": "召回策略", "value": "BM25 + FAISS 混合召回 + rerank"},
            {"step": "输出边界", "value": "初筛诊断、处置建议、继续检测项，不替代实验室确诊"},
        ]
        return {
            "question": normalized_question,
            "host": host or "石斑鱼",
            "triage": {
                "level": "中高风险",
                "primary_risk": "寄生虫 + 细菌性风险并行排查",
                "confidence": 0.88,
            },
            "answer": (
                "当前优先怀疑刺激隐核虫和弧菌感染两类风险。高氨氮与水温波动会放大细菌性风险，"
                "鳃丝苍白和体表摩擦则更接近寄生虫早期表现。建议先调水质并做镜检复核，"
                "再根据病原结果进入用药方案。"
            ),
            "actions": [
                {"type": "初筛结论", "value": "寄生虫 + 细菌性风险并行排查"},
                {"type": "优先处置", "value": "控氨氮、补溶氧、稳定水温"},
                {"type": "继续检测", "value": "鳃丝镜检、病灶图片、用药记录"},
            ],
            "follow_up": [
                "是否摄食下降？",
                "是否有镜检图片？",
                "是否近期换水或加药？",
            ],
            "query_plan": query_plan,
            "evidence": EVIDENCE_LIBRARY[: max(1, min(top_k, len(EVIDENCE_LIBRARY)))],
            "generated_at": _now_iso(),
        }

    def retrieval(self, query: str | None = None) -> dict[str, Any]:
        return {
            "active_cluster": {
                "name": "Milvus / FAISS Hybrid",
                "mode": "HNSW + Cosine + BM25 weighted fusion",
                "embedding": "bge-m3 / 1024 dim",
            },
            "collections": [
                {"name": "disease_triage_chunks", "description": "病例与诊疗分片", "vectors": 1024, "status": "online"},
                {"name": "disease_graph_edges", "description": "病-药-环关系边", "vectors": 768, "status": "online"},
                {"name": "env_warning_series", "description": "水质时间序列", "vectors": 512, "status": "evaluating"},
                {"name": "multimodal_casebook", "description": "图片与病例对照", "vectors": 1536, "status": "expanding"},
            ],
            "pipeline": [
                {"order": 1, "name": "文档解析", "detail": "诊疗规范 / 巡检记录"},
                {"order": 2, "name": "分片入库", "detail": "chunk + metadata"},
                {"order": 3, "name": "混合召回", "detail": "BM25 + vector"},
                {"order": 4, "name": "重排评测", "detail": "rerank + citation"},
                {"order": 5, "name": "预警输出", "detail": "风险分级 + 处置建议"},
            ],
            "evaluation": {
                "recall_at_5": 0.914,
                "map": 0.84,
                "citation_hit": 0.78,
                "alert_hit_rate": 0.71,
            },
            "query_replay": [
                {"rank": 1, "title": "石斑鱼寄生虫病害监测手册", "source": "disease_manual", "score": 0.92},
                {"rank": 2, "title": "高氨氮条件下弧菌扩增记录", "source": "env_reports", "score": 0.88},
                {"rank": 3, "title": "近 48 小时环境波动预警卡", "source": "warning_events", "score": 0.84},
                {"rank": 4, "title": "弧菌感染用药合规说明", "source": "drug_guideline", "score": 0.81},
            ],
            "query": query or "石斑鱼寄生虫病害与氨氮升高风险",
            "updated_at": "2026-05-16 09:40",
        }

    def alerts(self) -> dict[str, Any]:
        return {
            "summary": {
                "risk_level": "中高风险",
                "window": "48h",
                "hit_rate": 0.708,
                "recommended_action": "先控制环境指标，再做病原复核",
            },
            "signals": [
                {"name": "氨氮", "value": 0.42, "unit": "mg/L", "status": "high", "impact": "提升细菌性风险"},
                {"name": "溶氧", "value": 4.1, "unit": "mg/L", "status": "low", "impact": "增加应激反应"},
                {"name": "水温", "value": 29.4, "unit": "℃", "status": "fluctuating", "impact": "诱发病原扩增"},
                {"name": "pH", "value": 8.2, "unit": "", "status": "normal", "impact": "维持观察"},
            ],
            "risk_paths": [
                "高氨氮 -> 应激增强 -> 弧菌感染风险上升",
                "水温波动 -> 免疫下降 -> 寄生虫早期表现增加",
                "低溶氧 -> 摄食下降 -> 继发感染概率上升",
            ],
            "updated_at": _now_iso(),
        }


blueocean_service = BlueOceanService()
