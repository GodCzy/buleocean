<template>
  <div class="agent-page">
    <aside class="chat-sidebar">
      <div class="brand-block">
        <span>BlueOcean AI</span>
        <strong>疾病问答</strong>
      </div>
      <button type="button" class="new-chat">新建问诊</button>

      <section class="chat-list" aria-label="问诊会话">
        <button
          v-for="item in demo.chats"
          :key="item.title"
          type="button"
          :class="{ active: item.active }"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.meta }}</span>
        </button>
      </section>

      <section class="model-card">
        <span>当前模型链路</span>
        <strong>{{ demo.session.model }}</strong>
        <small>{{ demo.session.namespace }}</small>
      </section>
    </aside>

    <main class="chat-main">
      <header class="chat-header">
        <div>
          <p class="eyebrow">RAG Question Answering</p>
          <h1>{{ demo.title }}</h1>
          <p>{{ demo.subtitle }}</p>
        </div>
        <div class="header-chips">
          <span>{{ demo.session.name }}</span>
          <span>top-k {{ demo.session.topk }}</span>
        </div>
      </header>

      <section class="metric-row">
        <article v-for="item in demo.metrics" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <section class="conversation" aria-label="蓝海智询问答对话">
        <article
          v-for="message in demo.messages"
          :key="`${message.role}-${message.time}-${message.name}`"
          :class="['message', message.role, { compact: message.compact }]"
        >
          <div class="avatar">{{ message.name.slice(0, 1) }}</div>
          <div class="bubble">
            <div class="message-meta">
              <strong>{{ message.name }}</strong>
              <span>{{ message.time }}</span>
            </div>
            <p>{{ message.text }}</p>
            <div v-if="message.citations?.length" class="citation-row">
              <span v-for="item in message.citations" :key="item">{{ item }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="answer-cards">
        <article v-for="item in demo.answerCards" :key="item.title" :class="item.tone">
          <span>{{ item.title }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <footer class="composer">
        <button type="button">图片</button>
        <button type="button">水质</button>
        <div class="composer-input">{{ demo.composer }}</div>
        <button type="button" class="send">发送</button>
      </footer>
    </main>

    <aside class="right-panel">
      <section class="plan-card">
        <p class="eyebrow">Query Plan</p>
        <article v-for="item in demo.queryPlan" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </section>

      <section class="evidence-card">
        <p class="eyebrow">Evidence Rail</p>
        <article v-for="item in demo.evidence" :key="item.id">
          <div>
            <strong>{{ item.id }} · {{ item.title }}</strong>
            <span>{{ item.score }}</span>
          </div>
          <p>{{ item.quote }}</p>
          <small>{{ item.source }}</small>
        </article>
      </section>
    </aside>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { blueOceanApi } from '@/apis/blueocean_api'
import { blueOceanAgentDemo as fallbackDemo } from '@/data/blueOceanDemoData'

const demo = ref(fallbackDemo)

const toScore = (score) => Number(score || 0).toFixed(2)

const hydrateAgentDemo = (payload) => {
  if (!payload) return fallbackDemo

  const evidence = (payload.evidence || fallbackDemo.evidence).map((item) => ({
    id: item.id,
    title: item.title,
    score: toScore(item.score),
    source: item.source,
    quote: item.summary || item.quote
  }))

  const followUpText = (payload.follow_up || [])
    .filter(Boolean)
    .join(' ')

  return {
    ...fallbackDemo,
    metrics: [
      { label: 'Top-3 覆盖', value: '85%' },
      { label: '证据引用', value: String(evidence.length) },
      { label: '平均相似度', value: toScore(payload.triage?.confidence ?? 0.88) },
      { label: '回答耗时', value: '1.9s' }
    ],
    queryPlan: (payload.query_plan || fallbackDemo.queryPlan).map((item) => ({
      label: item.step || item.label,
      value: item.value
    })),
    messages: [
      {
        role: 'user',
        name: '养殖户',
        text: payload.question,
        time: '10:21'
      },
      {
        role: 'assistant',
        name: '蓝海智询',
        text: payload.answer,
        time: '10:21',
        citations: evidence.slice(0, 3).map((item) => item.id)
      },
      {
        role: 'assistant',
        name: '继续追问',
        text: `为了提高判断置信度，请补充：${followUpText || '是否摄食下降？是否有镜检图片？是否近期换水或加药？'}`,
        time: '10:22',
        compact: true
      }
    ],
    answerCards: (payload.actions || fallbackDemo.answerCards).map((item, index) => ({
      title: item.type || item.title,
      value: item.value,
      tone: ['blue', 'green', 'gold'][index] || 'blue'
    })),
    evidence,
    composer: `继续追问：${payload.follow_up?.[0] || '如果要定位寄生虫风险，我应该优先补充哪两类证据？'}`
  }
}

onMounted(async () => {
  try {
    demo.value = hydrateAgentDemo(
      await blueOceanApi.ask({
        question: fallbackDemo.messages[0].text,
        host: '石斑鱼',
        top_k: 3
      })
    )
  } catch (error) {
    console.warn('BlueOcean ask API unavailable, using fallback data.', error)
  }
})
</script>

<style scoped lang="less">
.agent-page {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 340px;
  min-height: 100%;
  background: #f7fbff;
  color: #102033;
}

.chat-sidebar,
.right-panel {
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.9);
}

.right-panel {
  border-right: none;
  border-left: 1px solid rgba(148, 163, 184, 0.18);
}

.chat-sidebar,
.right-panel,
.chat-main {
  padding: 22px;
}

.brand-block span,
.model-card span,
.metric-row span,
.plan-card span {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.brand-block strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 1.25rem;
}

.new-chat,
.chat-list button,
.composer button {
  border: 1px solid rgba(14, 116, 144, 0.16);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.new-chat {
  width: 100%;
  min-height: 42px;
  margin-top: 20px;
  color: #0369a1;
  font-weight: 800;
}

.chat-list {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}

.chat-list button {
  padding: 12px;
  text-align: left;
}

.chat-list button.active {
  border-color: rgba(14, 165, 233, 0.52);
  background: #e6f7ff;
}

.chat-list strong,
.chat-list span,
.model-card strong,
.model-card small {
  display: block;
}

.chat-list span {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.model-card {
  margin-top: 22px;
  padding: 14px;
  border-radius: 8px;
  background: #f1f8ff;
}

.model-card strong {
  margin-top: 8px;
}

.model-card small {
  margin-top: 6px;
  color: #0369a1;
}

.chat-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background:
    radial-gradient(circle at top, rgba(14, 165, 233, 0.08), transparent 26%),
    #f8fbff;
}

.chat-header,
.metric-row,
.message,
.message-meta,
.answer-cards,
.composer,
.header-chips,
.evidence-card article div {
  display: flex;
}

.chat-header {
  justify-content: space-between;
  gap: 20px;
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

.chat-header h1 {
  margin: 0;
  color: #071629;
  font-size: 2rem;
}

.chat-header p:not(.eyebrow) {
  max-width: 760px;
  margin: 10px 0 0;
  color: #496176;
  line-height: 1.7;
}

.header-chips {
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.header-chips span {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(14, 116, 144, 0.16);
  border-radius: 999px;
  background: #fff;
  color: #0f4c81;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.metric-row article {
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  background: #fff;
}

.metric-row strong {
  display: block;
  margin-top: 6px;
  font-size: 1.35rem;
}

.conversation {
  display: grid;
  gap: 16px;
  margin-top: 18px;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
}

.message {
  gap: 12px;
  max-width: 880px;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.avatar {
  display: grid;
  place-items: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #0ea5e9;
  color: #fff;
  font-weight: 900;
}

.message.assistant .avatar {
  background: #10b981;
}

.bubble {
  padding: 14px 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
}

.message.user .bubble {
  background: #e6f7ff;
}

.message.compact .bubble {
  border: 1px dashed rgba(14, 116, 144, 0.24);
}

.message-meta {
  justify-content: space-between;
  gap: 16px;
  color: #64748b;
  font-size: 12px;
}

.bubble p {
  margin: 9px 0 0;
  color: #1f2f3d;
  line-height: 1.75;
}

.citation-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.citation-row span {
  padding: 4px 9px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  font-weight: 800;
}

.answer-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.answer-cards article {
  padding: 14px 16px;
  border-radius: 8px;
  background: #fff;
  border-left: 4px solid #0ea5e9;
}

.answer-cards article.green {
  border-left-color: #10b981;
}

.answer-cards article.gold {
  border-left-color: #f59e0b;
}

.answer-cards span,
.answer-cards strong {
  display: block;
}

.answer-cards span {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.answer-cards strong {
  margin-top: 8px;
  color: #102033;
  line-height: 1.5;
}

.composer {
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 18px;
}

.composer button {
  min-height: 38px;
  padding: 0 12px;
  color: #0f4c81;
  font-weight: 800;
}

.composer .send {
  border-color: transparent;
  background: #0f87c8;
  color: #fff;
}

.composer-input {
  flex: 1;
  min-height: 46px;
  padding: 13px 16px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 12px;
  background: #fff;
  color: #334155;
}

.right-panel {
  display: grid;
  gap: 14px;
  align-content: start;
}

.plan-card,
.evidence-card {
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: #fff;
}

.plan-card article,
.evidence-card article {
  margin-top: 10px;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.plan-card strong {
  display: block;
  margin-top: 7px;
  color: #102033;
  line-height: 1.55;
}

.evidence-card article div {
  justify-content: space-between;
  gap: 10px;
}

.evidence-card strong {
  color: #102033;
  line-height: 1.4;
}

.evidence-card article div span {
  color: #0277bd;
  font-weight: 900;
}

.evidence-card p {
  margin: 10px 0 0;
  color: #496176;
  line-height: 1.65;
}

.evidence-card small {
  display: inline-block;
  margin-top: 8px;
  color: #64748b;
}

@media (max-width: 1320px) {
  .agent-page {
    grid-template-columns: 1fr;
  }

  .chat-sidebar,
  .right-panel {
    display: none;
  }
}
</style>
