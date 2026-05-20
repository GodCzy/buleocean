# 运维与验证

## 目标

蓝海智询公开仓库需要同时满足两件事：一是能说明系统如何运行，二是能证明前端展示和工程骨架没有失真。

## 构建验证

```powershell
pnpm --dir web build
npm run docs:build
```

## 推荐运行入口

- `/api/system/info`
- `/api/system/health`
- `/themes`
- `/knowledge`
- `/agent`
- `/graph`
- `/database`

## Docker 运行栈

仓库保留以下运行骨架：

- API 服务
- Worker 服务
- Web 前端
- Neo4j 图数据库
- Milvus 向量数据库
- PostgreSQL
- Redis
- MinIO

## 公开展示的验证重点

- 前端页面能正常打开并完成截图
- 知识图谱、问答和数据库三个核心界面能体现差异化
- README、docs 与前端展示口径一致
- 仓库顶层结构仍然体现完整系统项目，而不是纯素材包
