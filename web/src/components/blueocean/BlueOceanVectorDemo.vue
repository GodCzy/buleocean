<template>
  <div class="vector-page">
    <header class="vector-header">
      <div>
        <p class="eyebrow">Retrieval Infrastructure</p>
        <h1>{{ demo.title }}</h1>
        <p>{{ demo.subtitle }}</p>
      </div>
      <div class="cluster-card">
        <span>Active Cluster</span>
        <strong>{{ cluster.name }}</strong>
        <small>{{ cluster.mode }}</small>
      </div>
    </header>

    <section class="metric-grid">
      <article v-for="item in demo.metrics" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </article>
    </section>

    <section class="ops-grid">
      <article class="collections-card">
        <div class="panel-head">
          <p class="eyebrow">Collections</p>
          <h2>知识集合与命名空间</h2>
        </div>
        <section v-for="item in demo.collections" :key="item.name" class="collection-row">
          <div>
            <strong>{{ item.name }}</strong>
            <span>{{ item.type }}</span>
          </div>
          <p>{{ item.count }} vectors · {{ item.dim }}</p>
          <em :class="item.color">{{ item.status }}</em>
        </section>
      </article>

      <article class="topology-card">
        <div class="panel-head">
          <p class="eyebrow">Pipeline</p>
          <h2>从文档到回答的检索链路</h2>
        </div>
        <div class="pipeline">
          <section v-for="(item, index) in demo.pipeline" :key="item.label">
            <span>{{ index + 1 }}</span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.value }}</small>
          </section>
        </div>
        <dl class="schema-grid">
          <div v-for="[label, value] in demo.schema" :key="label">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </div>
        </dl>
      </article>

      <aside class="eval-card">
        <div class="panel-head">
          <p class="eyebrow">Evaluation</p>
          <h2>召回质量</h2>
        </div>
        <section v-for="item in demo.evaluations" :key="item.label" class="eval-row">
          <div>
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}%</strong>
          </div>
          <i><b :style="{ width: `${item.value}%` }"></b></i>
        </section>
      </aside>
    </section>

    <section class="bottom-grid">
      <article class="heatmap-card">
        <div class="panel-head">
          <p class="eyebrow">Metadata Filters</p>
          <h2>过滤条件与命中热度</h2>
        </div>
        <div class="filter-row">
          <span v-for="item in demo.filters" :key="item">{{ item }}</span>
        </div>
        <div class="heatmap">
          <div v-for="(row, rowIndex) in demo.heatmap" :key="rowIndex" class="heat-row">
            <i
              v-for="(value, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              :style="{ opacity: value / 100 }"
            >
              {{ value }}
            </i>
          </div>
        </div>
      </article>

      <article class="replay-card">
        <div class="panel-head">
          <p class="eyebrow">Query Replay</p>
          <h2>召回结果回放</h2>
        </div>
        <section v-for="item in demo.queryReplay" :key="item.rank" class="replay-row">
          <span>{{ item.rank }}</span>
          <div>
            <strong>{{ item.title }}</strong>
            <small>{{ item.namespace }}</small>
          </div>
          <em>{{ item.score }}</em>
        </section>
      </article>

      <article class="alert-card">
        <div class="panel-head">
          <p class="eyebrow">Risk Alert</p>
          <h2>48 小时环境预警</h2>
        </div>
        <div class="alert-summary">
          <strong>{{ alerts.summary.risk_level }}</strong>
          <span>{{ alerts.summary.recommended_action }}</span>
        </div>
        <section v-for="item in alerts.signals" :key="item.name" class="signal-row">
          <span>{{ item.name }}</span>
          <strong>{{ item.value }}{{ item.unit }}</strong>
          <em :class="item.status">{{ item.impact }}</em>
        </section>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { blueOceanApi } from '@/apis/blueocean_api'
import { blueOceanVectorDemo as fallbackDemo } from '@/data/blueOceanDemoData'

const demo = ref(fallbackDemo)
const alerts = ref({
  summary: {
    risk_level: '中高风险',
    recommended_action: '先控制环境指标，再做病原复核'
  },
  signals: [
    { name: '氨氮', value: 0.42, unit: 'mg/L', status: 'high', impact: '提升细菌性风险' },
    { name: '溶氧', value: 4.1, unit: 'mg/L', status: 'low', impact: '增加应激反应' },
    { name: '水温', value: 29.4, unit: '℃', status: 'fluctuating', impact: '诱发病原扩增' },
    { name: 'pH', value: 8.2, unit: '', status: 'normal', impact: '维持观察' }
  ]
})

const cluster = computed(() => ({
  name: demo.value.cluster?.name || 'Milvus / FAISS Hybrid',
  mode: demo.value.cluster?.mode || 'HNSW · Cosine · BM25 weighted fusion'
}))

const percent = (value) => Math.round(Number(value || 0) * 100)

const hydrateVectorDemo = (payload) => {
  if (!payload) return fallbackDemo

  return {
    ...fallbackDemo,
    cluster: payload.active_cluster,
    metrics: [
      { label: 'Collections', value: String(payload.collections?.length || 0), hint: '病害 / 用药 / 环境 / 规范 / 图片' },
      { label: 'mAP', value: `${percent(payload.evaluation?.map)}%`, hint: '混合召回评测集' },
      { label: 'Recall@5', value: `${percent(payload.evaluation?.recall_at_5)}%`, hint: '病害问答评测集' },
      { label: '48h 预警命中', value: `${percent(payload.evaluation?.alert_hit_rate)}%`, hint: '环境-疾病联动模型' }
    ],
    collections: (payload.collections || fallbackDemo.collections).map((item) => ({
      name: item.name,
      type: item.description || item.type,
      count: item.count || (item.name === 'disease_triage_chunks' ? '186k' : item.name === 'env_warning_series' ? '96k' : '58k'),
      dim: `${item.vectors || item.dim} dim`,
      status: item.status === 'online' ? '在线' : item.status === 'evaluating' ? '评测中' : item.status === 'expanding' ? '扩容中' : item.status,
      color: item.status === 'online' ? 'green' : item.status === 'evaluating' ? 'gold' : 'purple'
    })),
    pipeline: (payload.pipeline || fallbackDemo.pipeline).map((item) => ({
      label: item.name || item.label,
      value: item.detail || item.value
    })),
    schema: [
      ['当前集合', 'disease_triage_chunks'],
      ['混合检索', payload.active_cluster?.mode || 'BM25 + FAISS / weighted fusion'],
      ['Embedding 模型', payload.active_cluster?.embedding || 'bge-m3 / 1024 dim'],
      ['Rerank 模型', 'bge-reranker-v2'],
      ['预警模型', 'LightGBM / 48h risk score'],
      ['更新窗口', payload.updated_at || '2026-05-16 09:40']
    ],
    evaluations: [
      { label: 'Recall@5', value: percent(payload.evaluation?.recall_at_5) },
      { label: 'mAP', value: percent(payload.evaluation?.map) },
      { label: 'Citation Hit', value: percent(payload.evaluation?.citation_hit) },
      { label: 'Alert Hit Rate', value: percent(payload.evaluation?.alert_hit_rate) }
    ],
    queryReplay: (payload.query_replay || fallbackDemo.queryReplay).map((item) => ({
      rank: `Top ${item.rank}`,
      title: item.title,
      namespace: item.source || item.namespace,
      score: Number(item.score || 0).toFixed(2)
    }))
  }
}

onMounted(async () => {
  try {
    const [retrievalPayload, alertsPayload] = await Promise.all([
      blueOceanApi.retrieval('石斑鱼寄生虫病害与氨氮升高风险'),
      blueOceanApi.alerts()
    ])
    demo.value = hydrateVectorDemo(retrievalPayload)
    alerts.value = alertsPayload || alerts.value
  } catch (error) {
    console.warn('BlueOcean retrieval API unavailable, using fallback data.', error)
  }
})
</script>

<style scoped lang="less">
.vector-page {
  min-height: 100%;
  padding: 24px;
  color: #102033;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.08), transparent 28%),
    linear-gradient(180deg, #f6fbff, #f8fafc);
}

.vector-header,
.metric-grid,
.ops-grid,
.bottom-grid,
.panel-head,
.collection-row,
.pipeline,
.eval-row div,
.filter-row,
.replay-row,
.signal-row {
  display: flex;
}

.vector-header {
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 8px;
  color: #0277bd;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vector-header h1,
.panel-head h2 {
  margin: 0;
  color: #071629;
}

.vector-header h1 {
  font-size: 2.1rem;
}

.vector-header p:not(.eyebrow) {
  max-width: 820px;
  margin: 10px 0 0;
  color: #496176;
  line-height: 1.7;
}

.cluster-card,
.metric-grid article,
.collections-card,
.topology-card,
.eval-card,
.heatmap-card,
.replay-card,
.alert-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
}

.cluster-card {
  width: 300px;
  padding: 16px;
}

.cluster-card span,
.cluster-card small,
.metric-grid span,
.metric-grid small,
.collection-row span,
.schema-grid dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.cluster-card strong,
.cluster-card small {
  display: block;
}

.cluster-card strong {
  margin-top: 8px;
}

.cluster-card small {
  margin-top: 6px;
  line-height: 1.45;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.metric-grid article {
  min-height: 90px;
  padding: 16px 18px;
}

.metric-grid strong {
  display: block;
  margin: 6px 0;
  font-size: 1.5rem;
}

.ops-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr) 300px;
  gap: 14px;
  margin-top: 14px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px 360px;
  gap: 14px;
  margin-top: 14px;
}

.collections-card,
.topology-card,
.eval-card,
.heatmap-card,
.replay-card,
.alert-card {
  padding: 18px;
}

.panel-head {
  display: block;
  margin-bottom: 14px;
}

.collection-row,
.replay-row,
.signal-row {
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.collection-row:last-child,
.replay-row:last-child,
.signal-row:last-child {
  border-bottom: none;
}

.collection-row div,
.replay-row div {
  flex: 1;
  min-width: 0;
}

.collection-row strong,
.collection-row span,
.replay-row strong,
.replay-row small {
  display: block;
}

.collection-row p {
  width: 120px;
  margin: 0;
  color: #496176;
  font-size: 12px;
  font-weight: 700;
}

.collection-row em,
.replay-row em,
.signal-row em {
  border-radius: 999px;
  padding: 5px 9px;
  background: #e0f2fe;
  color: #0369a1;
  font-style: normal;
  font-size: 12px;
  font-weight: 900;
}

.collection-row em.green {
  background: #dcfce7;
  color: #15803d;
}

.collection-row em.gold,
.signal-row em.fluctuating {
  background: #fef3c7;
  color: #b45309;
}

.collection-row em.purple {
  background: #ede9fe;
  color: #6d28d9;
}

.signal-row em.high,
.signal-row em.low {
  background: #ffe4e6;
  color: #be123c;
}

.signal-row em.normal {
  background: #dcfce7;
  color: #15803d;
}

.pipeline {
  align-items: stretch;
  gap: 10px;
}

.pipeline section {
  flex: 1;
  min-height: 112px;
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
}

.pipeline span {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #0ea5e9;
  color: #fff;
  font-weight: 900;
}

.pipeline strong,
.pipeline small {
  display: block;
}

.pipeline strong {
  margin-top: 12px;
}

.pipeline small {
  margin-top: 8px;
  color: #496176;
  line-height: 1.45;
}

.schema-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0 0;
}

.schema-grid div {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.schema-grid dd {
  margin: 6px 0 0;
  color: #102033;
  font-weight: 800;
  line-height: 1.45;
}

.eval-row {
  display: block;
  margin-top: 14px;
}

.eval-row div {
  justify-content: space-between;
  gap: 10px;
}

.eval-row span {
  color: #334155;
  font-weight: 800;
}

.eval-row i {
  display: block;
  height: 10px;
  margin-top: 9px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.eval-row b {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0ea5e9, #10b981);
}

.filter-row {
  gap: 8px;
  flex-wrap: wrap;
}

.filter-row span {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: #e6f7ff;
  color: #075985;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.heatmap {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.heat-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.heat-row i {
  display: grid;
  place-items: center;
  min-height: 48px;
  border-radius: 8px;
  background: #0ea5e9;
  color: #fff;
  font-style: normal;
  font-weight: 900;
}

.replay-row span {
  width: 52px;
  color: #0277bd;
  font-size: 12px;
  font-weight: 900;
}

.replay-row small {
  margin-top: 5px;
  color: #64748b;
}

.alert-summary {
  padding: 14px;
  border-radius: 8px;
  background: #fff7ed;
}

.alert-summary strong,
.alert-summary span {
  display: block;
}

.alert-summary strong {
  color: #c2410c;
  font-size: 1.35rem;
}

.alert-summary span {
  margin-top: 8px;
  color: #7c2d12;
  line-height: 1.6;
}

.signal-row span {
  width: 54px;
  color: #64748b;
  font-weight: 800;
}

.signal-row strong {
  width: 72px;
}

.signal-row em {
  flex: 1;
  text-align: center;
}

@media (max-width: 1320px) {
  .vector-header,
  .ops-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .cluster-card {
    width: auto;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
