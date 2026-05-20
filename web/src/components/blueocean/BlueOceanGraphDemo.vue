<template>
  <div class="graph-page">
    <header class="graph-header">
      <div>
        <p class="eyebrow">Disease Knowledge Graph</p>
        <h1>{{ demo.title }}</h1>
        <p>{{ demo.subtitle }}</p>
      </div>
      <div class="graph-actions">
        <button type="button">关系过滤</button>
        <button type="button">导出子图</button>
        <button type="button" class="primary">生成诊断路径</button>
      </div>
    </header>

    <section class="stat-strip">
      <article v-for="item in demo.stats" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.hint }}</small>
      </article>
    </section>

    <section class="graph-workspace">
      <aside class="left-rail">
        <div class="search-box">
          <span>当前病例</span>
          <strong>石斑鱼鳃丝苍白 + 氨氮升高</strong>
        </div>
        <div class="filter-list">
          <button
            v-for="item in demo.filters"
            :key="item"
            type="button"
            :class="{ active: item === '石斑鱼' || item === '寄生虫病' }"
          >
            {{ item }}
          </button>
        </div>
        <div class="mini-map" aria-label="图谱缩略图">
          <i v-for="node in miniNodes" :key="node.id" :class="node.tone" :style="{ left: node.x, top: node.y }"></i>
        </div>
      </aside>

      <main class="graph-canvas-card">
        <div class="canvas-toolbar">
          <div class="legend">
            <span v-for="item in demo.legend" :key="item.label">
              <i :class="item.tone"></i>{{ item.label }}
            </span>
          </div>
          <div class="toolbar-metrics">
            <span>布局：force-directed</span>
            <span>高亮：高置信链路</span>
          </div>
        </div>

        <svg class="graph-svg" viewBox="0 0 1220 760" aria-label="病药环大型知识图谱">
          <defs>
            <filter id="graphShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="rgba(15, 23, 42, 0.16)" />
            </filter>
            <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="rgba(15, 118, 110, 0.58)" />
            </marker>
          </defs>

          <path
            v-for="edge in edgePaths"
            :key="`${edge.from}-${edge.to}`"
            :d="edge.path"
            :class="['edge-line', { strong: edge.score > 0.86 }]"
            marker-end="url(#arrowHead)"
          />
          <text
            v-for="edge in edgePaths"
            :key="`${edge.from}-${edge.to}-label`"
            :x="edge.labelX"
            :y="edge.labelY"
            class="edge-label"
          >
            {{ edge.label }}
          </text>

          <g
            v-for="node in demo.nodes"
            :key="node.id"
            :transform="`translate(${node.x}, ${node.y})`"
            :class="['graph-node', node.tone]"
          >
            <circle class="node-halo" :r="node.size + 13" />
            <circle class="node-core" :r="node.size" filter="url(#graphShadow)" />
            <text class="node-label" text-anchor="middle" y="-3">{{ node.label }}</text>
            <text class="node-meta" text-anchor="middle" y="20">{{ node.meta }}</text>
          </g>
        </svg>
      </main>

      <aside class="inspector">
        <section class="inspector-card">
          <p class="eyebrow">Selected Path</p>
          <h2>{{ demo.inspector.entity }}</h2>
          <div class="risk-row">
            <span>{{ demo.inspector.type }}</span>
            <strong>置信度 {{ demo.inspector.confidence }}</strong>
          </div>
          <dl>
            <div v-for="[label, value] in demo.inspector.attributes" :key="label">
              <dt>{{ label }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>
        </section>

        <section class="inspector-card">
          <p class="eyebrow">Evidence</p>
          <article v-for="item in demo.inspector.evidence" :key="item.title" class="evidence-item">
            <strong>{{ item.title }}</strong>
            <span>{{ item.source }}</span>
            <small>match {{ item.score }}</small>
          </article>
        </section>
      </aside>
    </section>

    <section class="relation-table">
      <div class="section-title">
        <p class="eyebrow">High Confidence Chains</p>
        <h2>高置信病-药-环链路</h2>
      </div>
      <article v-for="item in demo.relationTable" :key="item.chain">
        <span>{{ item.chain }}</span>
        <div class="score-track"><i :style="{ width: `${item.score}%` }"></i></div>
        <strong>{{ item.score }}</strong>
        <em>{{ item.action }}</em>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { blueOceanApi } from '@/apis/blueocean_api'
import { blueOceanGraphDemo as fallbackDemo } from '@/data/blueOceanDemoData'

const demo = ref(fallbackDemo)

const formatCount = (value) => {
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`
  return Number(value || 0).toLocaleString('zh-CN')
}

const hydrateGraphDemo = (payload) => {
  if (!payload) return fallbackDemo

  const stats = [
    { label: '实体节点', value: formatCount(payload.statistics?.nodes), hint: '宿主 / 病原 / 药物 / 环境 / 症状' },
    { label: '关系边', value: formatCount(payload.statistics?.edges), hint: '致病 / 诱发 / 处置 / 禁忌 / 预警' },
    { label: '证据片段', value: formatCount(payload.statistics?.evidence_chunks), hint: '手册 / 规范 / 病例 / 监测记录' },
    { label: '高风险链路', value: formatCount(payload.statistics?.high_risk_paths), hint: '已建立病-药-环因果回溯' }
  ]

  const inspector = {
    ...fallbackDemo.inspector,
    entity: payload.selected_path?.title || fallbackDemo.inspector.entity,
    confidence: String(payload.selected_path?.confidence ?? fallbackDemo.inspector.confidence),
    attributes: [
      ['宿主', payload.selected_path?.host || '石斑鱼 / 幼鱼阶段'],
      ['候选病害', (payload.selected_path?.candidate_diseases || []).join('、') || '刺激隐核虫、弧菌感染'],
      ['环境诱因', (payload.selected_path?.environment_triggers || []).join('、') || '氨氮升高、溶氧下降、水温波动'],
      ['处置边界', payload.selected_path?.boundary || '先镜检复核，再进入药物方案']
    ],
    evidence: (payload.evidence || []).map((item) => ({
      title: item.title,
      source: item.source,
      score: Number(item.score || 0).toFixed(2)
    }))
  }

  return {
    ...fallbackDemo,
    stats,
    inspector
  }
}

onMounted(async () => {
  try {
    demo.value = hydrateGraphDemo(await blueOceanApi.graph())
  } catch (error) {
    console.warn('BlueOcean graph API unavailable, using fallback data.', error)
  }
})

const nodeMap = computed(() => Object.fromEntries(demo.value.nodes.map((node) => [node.id, node])))

const edgePaths = computed(() =>
  demo.value.edges
    .map((edge, index) => {
      const from = nodeMap.value[edge.from]
      const to = nodeMap.value[edge.to]
      if (!from || !to) return null
      const dx = to.x - from.x
      const dy = to.y - from.y
      const curve = index % 2 === 0 ? 0.16 : -0.16
      const midX = (from.x + to.x) / 2 - dy * curve
      const midY = (from.y + to.y) / 2 + dx * curve

      return {
        ...edge,
        score: 0.78 + ((index % 5) * 0.04),
        path: `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`,
        labelX: midX,
        labelY: midY - 8
      }
    })
    .filter(Boolean)
)

const miniNodes = computed(() =>
  demo.value.nodes.map((node) => ({
    id: node.id,
    tone: node.tone,
    x: `${(node.x / 1220) * 100}%`,
    y: `${(node.y / 760) * 100}%`
  }))
)
</script>

<style scoped lang="less">
.graph-page {
  min-height: 100%;
  padding: 18px 24px 24px;
  color: #102033;
  background:
    linear-gradient(180deg, rgba(239, 249, 255, 0.92), rgba(247, 250, 252, 0.96)),
    #f8fbff;
}

.graph-header,
.stat-strip,
.graph-workspace,
.canvas-toolbar,
.legend,
.toolbar-metrics,
.risk-row,
.relation-table article,
.graph-actions {
  display: flex;
}

.graph-header {
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

.graph-header h1,
.section-title h2,
.inspector h2 {
  margin: 0;
  color: #092033;
}

.graph-header h1 {
  font-size: 1.95rem;
  line-height: 1.12;
}

.graph-header p:not(.eyebrow) {
  max-width: 840px;
  margin: 8px 0 0;
  color: #496176;
  line-height: 1.7;
}

.graph-actions {
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.graph-actions button,
.filter-list button {
  min-height: 36px;
  border: 1px solid rgba(14, 116, 144, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  color: #0f4c81;
  font-weight: 700;
  cursor: pointer;
}

.graph-actions button {
  padding: 0 14px;
}

.graph-actions .primary {
  background: #0f87c8;
  color: #fff;
}

.stat-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.stat-strip article,
.left-rail,
.graph-canvas-card,
.inspector-card,
.relation-table {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
}

.stat-strip article {
  min-height: 72px;
  padding: 12px 16px;
}

.stat-strip span,
.stat-strip small {
  color: #64748b;
}

.stat-strip strong {
  display: block;
  margin: 3px 0;
  color: #071629;
  font-size: 1.35rem;
}

.graph-workspace {
  gap: 14px;
  margin-top: 12px;
  align-items: stretch;
}

.left-rail {
  width: 210px;
  padding: 16px;
}

.search-box {
  padding: 14px;
  border-radius: 8px;
  background: #eef9ff;
}

.search-box span,
.search-box strong {
  display: block;
}

.search-box span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.search-box strong {
  margin-top: 8px;
  color: #0f172a;
  line-height: 1.55;
}

.filter-list {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.filter-list button {
  justify-content: flex-start;
  padding: 0 10px;
  text-align: left;
}

.filter-list .active {
  border-color: rgba(14, 165, 233, 0.46);
  background: #dff5ff;
}

.mini-map {
  position: relative;
  height: 150px;
  margin-top: 14px;
  border-radius: 8px;
  background:
    linear-gradient(rgba(14, 165, 233, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 165, 233, 0.08) 1px, transparent 1px),
    #f8fbff;
  background-size: 18px 18px;
}

.mini-map i {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.graph-canvas-card {
  flex: 1;
  min-width: 0;
  padding: 14px;
}

.canvas-toolbar {
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.legend,
.toolbar-metrics {
  gap: 10px;
  flex-wrap: wrap;
}

.legend span,
.toolbar-metrics span {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  gap: 7px;
  color: #466174;
  font-size: 12px;
  font-weight: 700;
}

.legend i,
.mini-map i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.host {
  background: #0284c7;
}

.disease {
  background: #e11d48;
}

.drug {
  background: #f59e0b;
}

.environment {
  background: #10b981;
}

.symptom {
  background: #7c3aed;
}

.graph-svg {
  width: 100%;
  height: min(60vh, 640px);
  min-height: 520px;
  border-radius: 8px;
  background:
    linear-gradient(rgba(56, 189, 248, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.055) 1px, transparent 1px),
    linear-gradient(180deg, #f8fcff, #edf8ff);
  background-size: 28px 28px, 28px 28px, auto;
}

.edge-line {
  fill: none;
  stroke: rgba(15, 118, 110, 0.32);
  stroke-width: 2.1;
}

.edge-line.strong {
  stroke: rgba(2, 132, 199, 0.58);
  stroke-width: 3;
}

.edge-label {
  fill: #075985;
  font-size: 11px;
  font-weight: 800;
  text-anchor: middle;
}

.node-halo {
  fill: rgba(255, 255, 255, 0.78);
  stroke: rgba(14, 165, 233, 0.18);
  stroke-width: 2;
}

.node-core {
  stroke: #fff;
  stroke-width: 2.4;
}

.graph-node.host .node-core {
  fill: #0284c7;
}

.graph-node.disease .node-core {
  fill: #e11d48;
}

.graph-node.drug .node-core {
  fill: #f59e0b;
}

.graph-node.environment .node-core {
  fill: #10b981;
}

.graph-node.symptom .node-core {
  fill: #7c3aed;
}

.node-label,
.node-meta {
  fill: #fff;
  font-weight: 800;
}

.node-label {
  font-size: 14px;
}

.node-meta {
  font-size: 10px;
  opacity: 0.9;
}

.inspector {
  width: 330px;
  display: grid;
  gap: 14px;
}

.inspector-card {
  padding: 18px;
}

.inspector-card h2 {
  font-size: 1.1rem;
  line-height: 1.45;
}

.risk-row {
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #e8f8ff;
  color: #075985;
  font-weight: 800;
}

.inspector dl {
  display: grid;
  gap: 10px;
  margin: 14px 0 0;
}

.inspector dl div,
.evidence-item {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.inspector dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.inspector dd {
  margin: 6px 0 0;
  color: #0f172a;
  font-weight: 800;
  line-height: 1.55;
}

.evidence-item {
  display: block;
  margin-top: 10px;
}

.evidence-item strong,
.evidence-item span,
.evidence-item small {
  display: block;
}

.evidence-item span {
  margin-top: 6px;
  color: #64748b;
}

.evidence-item small {
  margin-top: 8px;
  color: #0284c7;
  font-weight: 800;
}

.relation-table {
  margin-top: 14px;
  padding: 18px;
}

.section-title {
  margin-bottom: 12px;
}

.relation-table article {
  align-items: center;
  gap: 14px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.relation-table article:last-child {
  border-bottom: none;
}

.relation-table article span {
  flex: 1;
  color: #1f2f3d;
  font-weight: 700;
}

.score-track {
  width: 220px;
  height: 9px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.score-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0ea5e9, #10b981);
}

.relation-table strong {
  width: 38px;
}

.relation-table em {
  width: 96px;
  color: #0369a1;
  font-style: normal;
  font-weight: 800;
}

@media (max-width: 900px) {
  .graph-header,
  .graph-workspace {
    flex-direction: column;
  }

  .left-rail,
  .inspector {
    width: auto;
  }

  .stat-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
