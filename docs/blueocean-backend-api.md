# 蓝海智询后端接口说明

蓝海智询后端在现有 FastAPI 工程中新增 `/api/blueocean` 业务接口组，用于支撑水生动物疾病问答平台的核心展示与后续工程化扩展。

## 接口总览

| 接口 | 方法 | 作用 |
| --- | --- | --- |
| `/api/blueocean/health` | GET | 检查蓝海智询业务后端状态 |
| `/api/blueocean/overview` | GET | 获取项目总览、指标和模块状态 |
| `/api/blueocean/graph` | GET | 获取病-药-环知识图谱节点、关系和诊断链路 |
| `/api/blueocean/ask` | POST | 提交疾病问诊问题，返回 RAG 风格诊断建议 |
| `/api/blueocean/retrieval` | GET | 获取向量检索、混合召回、评测和召回回放数据 |
| `/api/blueocean/alerts` | GET | 获取环境风险预警、指标状态和风险路径 |

## 业务定位

这组接口承担蓝海智询的领域业务后端职责，重点覆盖：

- 病-药-环知识图谱数据组织
- RAG 问答结果结构化输出
- 向量检索与召回质量评测
- 水质环境风险预警
- 前端驾驶舱与业务演示数据支撑

当前实现采用可运行的内置领域样例数据，后续可以替换为真实数据库、图数据库、向量数据库和大模型服务。

## 前端接入

前端通过 `web/src/apis/blueocean_api.js` 统一访问蓝海智询接口，并在三个核心展示组件中优先读取后端数据：

| 前端页面/组件 | 接口来源 | 展示内容 |
| --- | --- | --- |
| `BlueOceanGraphDemo.vue` | `/api/blueocean/graph` | 病-药-环知识图谱统计、选中诊断链路、证据引用 |
| `BlueOceanAgentDemo.vue` | `/api/blueocean/ask` | 类 ChatGPT 问诊对话、RAG 回答、Query Plan、证据侧栏 |
| `BlueOceanVectorDemo.vue` | `/api/blueocean/retrieval`、`/api/blueocean/alerts` | 向量集合、混合召回链路、评测指标、48 小时环境预警 |

为了保证运行体验稳定，前端仍保留 `blueOceanDemoData.js` 作为 fallback 数据源；当后端未启动或接口不可用时，页面不会空白，会自动展示内置业务样例数据。

## 典型请求

### 智能问答

```http
POST /api/blueocean/ask
Content-Type: application/json

{
  "question": "石斑鱼体表摩擦、鳃丝发白，最近氨氮升高，应该优先怀疑什么？",
  "host": "石斑鱼",
  "top_k": 3
}
```

返回内容包括：

- 风险等级
- 初筛结论
- 处置建议
- 继续追问项
- Query Plan
- 证据引用列表

### 知识图谱

```http
GET /api/blueocean/graph
```

返回内容包括：

- 图谱统计
- 实体节点
- 关系边
- 选中诊断链路
- 证据片段

### 向量检索

```http
GET /api/blueocean/retrieval?query=弧菌感染%20氨氮
```

返回内容包括：

- 知识集合
- 检索链路
- 召回评测指标
- Query Replay 结果

## 后续扩展路径

| 当前能力 | 后续可替换为 |
| --- | --- |
| 内置图谱样例数据 | Neo4j 图数据库 |
| 内置证据片段 | PostgreSQL / MinIO 文档资产 |
| 内置召回结果 | Milvus / FAISS 向量检索 |
| 规则化问答输出 | 大模型 RAG 编排服务 |
| 静态预警指标 | 真实水质监测数据与预警模型 |

## 验证方式

在已安装项目依赖并启动 FastAPI 后，可访问：

```powershell
uvicorn server.main:app --host 127.0.0.1 --port 5050
```

然后检查：

```powershell
curl http://127.0.0.1:5050/api/blueocean/health
curl http://127.0.0.1:5050/api/blueocean/overview
curl http://127.0.0.1:5050/api/blueocean/graph
curl http://127.0.0.1:5050/api/blueocean/retrieval
curl http://127.0.0.1:5050/api/blueocean/alerts
```

单元测试文件：

```text
test/test_blueocean_router.py
```
