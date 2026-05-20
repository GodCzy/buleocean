<template>
  <div class="knowledgePath-workbench">
    <header class="workbench-header">
      <div class="header-copy">
        <p class="eyebrow">KNOWLEDGE WORKSPACE</p>
        <h1>{{ currentThemeName }}</h1>
        <p class="header-subtitle">{{ currentThemeDescription }}</p>
      </div>

      <div class="header-actions">
        <router-link class="header-link" to="/knowledge">返回知识路径入口</router-link>
        <router-link class="header-link" to="/themes">知识模块</router-link>
      </div>
    </header>

    <section class="module-strip" role="tablist" aria-label="蓝海智询模块">
      <button
        v-for="theme in availableThemes"
        :key="theme.id"
        class="module-pill"
        :class="{ active: theme.id === currentThemeId }"
        type="button"
        @click="switchTheme(theme.id)"
      >
        <span>{{ theme.name }}</span>
      </button>
    </section>

    <main class="workbench-shell">
      <section v-if="!hasThemeId" class="unsupported-shell">
        <div class="unsupported-card">
          <p class="eyebrow">NO MODULE SELECTED</p>
          <h2>请先选择一个知识模块</h2>
          <p class="unsupported-description">工作台不会默认绑定旧模块，请先从知识路径入口选择蓝海智询模块。</p>
          <div class="unsupported-actions">
            <router-link class="header-link" to="/knowledge">返回知识路径入口</router-link>
            <router-link class="header-link" to="/themes">查看知识模块</router-link>
          </div>
        </div>
      </section>

      <template v-else-if="isThemeSupported">
        <section class="workbench-grid">
          <section class="stage-column">
            <section class="stage-panel">
              <KnowledgePathBranchCanvas
                class="canvas-panel"
                :tree="knowledgePathStore.tree"
                :active-branch-id="knowledgePathStore.activeBranchId"
                :selected-node-id="knowledgePathStore.selectedNodeId"
                :branch-count="knowledgePathStore.branchCount"
                :display-meta="knowledgePathStore.displayMeta || {}"
                @select-node="handleNodeSelection"
              />
            </section>

            <section class="selection-brief" v-if="activeBranch">
              <div>
                <p class="brief-tag">当前路径</p>
                <p class="brief-title">{{ activeBranch.title }}</p>
              </div>
              <span class="brief-chip">{{ activeBranch.branchTone }}</span>
            </section>

            <section class="dialogue-panel">
              <div class="dialogue-head">
                <strong>继续生成，或带着这条路径进入问答视角</strong>
                <p class="dialogue-hint">{{ handoffHint }}</p>
              </div>

              <div class="dialogue-input-wrap">
                <input
                  class="dialogue-input"
                  :value="questionDraft"
                  type="text"
                  placeholder="输入宿主、症状、环境波动、检索目标或预警问题"
                  @input="questionDraft = $event.target.value"
                  @keydown.enter.prevent="generateBaseKnowledgePath"
                >
                <button class="dialogue-send" type="button" :disabled="isGenerating" @click="generateBaseKnowledgePath">
                  {{ isGenerating ? '生成中…' : '生成知识路径' }}
                </button>
              </div>

              <div class="dialogue-actions">
                <button class="secondary-btn" type="button" @click="goToThemeChat">带当前路径继续问答</button>
              </div>
            </section>
          </section>

          <aside class="insight-column">
            <section class="insight-card">
              <div class="insight-head">
                <div>
                  <p class="eyebrow">PATH SUMMARY</p>
                  <h2>路径摘要</h2>
                </div>
                <span class="insight-count">{{ knowledgePathStore.branchCount }} 条</span>
              </div>

              <p class="summary-copy">{{ activeBranch?.summary || '选择一条路径后，这里会展示当前路径的摘要说明。' }}</p>

              <div v-if="activeBranch?.suitability?.length" class="tag-list">
                <span v-for="item in activeBranch.suitability" :key="item">{{ item }}</span>
              </div>

              <div v-if="activeBranch" class="meta-grid">
                <div class="meta-item">
                  <span>风险</span>
                  <strong>{{ activeBranch.riskLabel }}</strong>
                </div>
                <div class="meta-item">
                  <span>投入</span>
                  <strong>{{ activeBranch.costLabel }}</strong>
                </div>
                <div class="meta-item">
                  <span>图谱</span>
                  <strong>{{ activeBranch.graphLabel }}</strong>
                </div>
                <div class="meta-item">
                  <span>信心</span>
                  <strong>{{ activeBranch.confidenceLabel }}</strong>
                </div>
              </div>
            </section>

            <section class="insight-card">
              <div class="insight-head">
                <div>
                  <p class="eyebrow">EVIDENCE</p>
                  <h2>证据与关联卡片</h2>
                </div>
                <span class="insight-count">{{ activeEvidenceRefs.length }}</span>
              </div>

              <div v-if="activeEvidenceRefs.length" class="evidence-list">
                <article v-for="item in activeEvidenceRefs" :key="item.id" class="evidence-item">
                  <div class="evidence-top">
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.typeLabel }}</span>
                  </div>
                  <p>{{ item.summary }}</p>
                </article>
              </div>
              <p v-else class="empty-copy">当前路径还没有可用的证据卡片。</p>
            </section>

            <section class="insight-card">
              <div class="insight-head">
                <div>
                  <p class="eyebrow">NEXT ACTIONS</p>
                  <h2>后续动作</h2>
                </div>
                <span class="insight-count">{{ activeActions.length }}</span>
              </div>

              <div v-if="activeActions.length" class="action-list">
                <article v-for="action in activeActions" :key="action.id" class="action-item">
                  <strong>{{ action.label }}</strong>
                  <p>{{ action.description }}</p>
                </article>
              </div>
              <p v-else class="empty-copy">选择一条路径后，系统会给出后续动作建议。</p>
            </section>
          </aside>
        </section>
      </template>

      <section v-else class="unsupported-shell">
        <div class="unsupported-card">
          <p class="eyebrow">UNSUPPORTED MODULE</p>
          <h2>{{ unsupportedTitle }}</h2>
          <p class="unsupported-description">{{ unsupportedDescription }}</p>
          <div class="unsupported-actions">
            <router-link class="header-link" to="/knowledge">返回知识路径入口</router-link>
            <router-link class="header-link" to="/themes">返回知识模块</router-link>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInfoStore } from '@/stores/info'
import { useUserStore } from '@/stores/user'
import { useAgentStore } from '@/stores/agent'
import { useThemeContextStore } from '@/stores/themeContext'
import { useKnowledgePathContextStore } from '@/stores/knowledgeContext'
import { getKnowledgePathDefaultQuestion, hasKnowledgePathAdapter, resolveKnowledgePathAdapter } from '@/data/knowledge'
import KnowledgePathBranchCanvas from '@/components/knowledge/KnowledgePathBranchCanvas.vue'

const route = useRoute()
const router = useRouter()
const infoStore = useInfoStore()
const userStore = useUserStore()
const agentStore = useAgentStore()
const themeContextStore = useThemeContextStore()
const knowledgePathStore = useKnowledgePathContextStore()
const KNOWLEDGE_PATH_HANDOFF_KEY = 'knowledgePath_agent_handoff'

const questionDraft = ref('')
const isGenerating = ref(false)

const currentThemeId = computed(() => String(route.params.themeId || '').trim().toLowerCase())
const hasThemeId = computed(() => Boolean(currentThemeId.value))
const currentThemeAdapter = computed(() => resolveKnowledgePathAdapter(currentThemeId.value))
const isThemeSupported = computed(() => Boolean(currentThemeAdapter.value))
const currentThemeMeta = computed(() => infoStore.getThemeById(currentThemeId.value))
const currentThemeName = computed(() => currentThemeMeta.value?.name || '蓝海智询工作台')
const currentThemeDescription = computed(
  () => currentThemeMeta.value?.description || '围绕当前模块生成可继续问答、可追溯、可解释的水生动物疾病知识路径。'
)
const availableThemes = computed(() => (infoStore.themes || []).filter((theme) => hasKnowledgePathAdapter(theme.id)))
const incomingQuestion = computed(() => (typeof route.query.question === 'string' ? route.query.question.trim() : ''))
const activeBranch = computed(() => knowledgePathStore.activeBranch)
const activeEvidenceRefs = computed(() => knowledgePathStore.evidenceRefs || [])
const activeActions = computed(() => knowledgePathStore.nextActions || [])

const unsupportedTitle = computed(() =>
  hasThemeId.value ? `模块 ${currentThemeId.value} 尚未接入知识路径适配器` : '当前未指定模块'
)
const unsupportedDescription = computed(() => '当前模块没有知识路径适配器，请先返回模块入口选择可用模块。')

const handoffHint = computed(() => {
  if (!activeBranch.value) {
    return '先选中一条路径，再把这条路径带进问答界面继续追问。'
  }

  return `当前会基于“${activeBranch.value.title}”继续组织问答上下文，并保留图谱与证据摘要。`
})

const ensureDefaultAgent = async () => {
  if (!agentStore.isInitialized) {
    await agentStore.initialize()
  }
  return agentStore.defaultAgent?.id || agentStore.selectedAgentId || ''
}

const syncThemeContextFromBranch = (branch) => {
  if (!branch?.context) return null
  return themeContextStore.setThemeContext(branch.context)
}

const applyKnowledgePathResult = (result, source) => {
  knowledgePathStore.hydrate(result)
  knowledgePathStore.rememberGenerationSource(source)
  questionDraft.value = result.rootQuestion
  syncThemeContextFromBranch(knowledgePathStore.activeBranch)
}

const generateBaseKnowledgePath = async () => {
  if (!isThemeSupported.value || !currentThemeAdapter.value) {
    knowledgePathStore.reset()
    return
  }

  isGenerating.value = true
  knowledgePathStore.clearHandoff()
  const result = currentThemeAdapter.value.buildKnowledgePath(questionDraft.value, {
    theme: currentThemeId.value,
    module: currentThemeId.value
  })
  applyKnowledgePathResult(result, 'base-generate')
  isGenerating.value = false
}

const handleNodeSelection = (nodeId) => {
  knowledgePathStore.clearHandoff()
  knowledgePathStore.setSelectedNode(nodeId)
  syncThemeContextFromBranch(knowledgePathStore.activeBranch)
}

const buildAgentLocation = async (branch) => {
  syncThemeContextFromBranch(branch)
  const query = themeContextStore.toRouteQuery(branch.context)
  const defaultAgentId = await ensureDefaultAgent()
  if (defaultAgentId) {
    return {
      name: 'AgentCompWithId',
      params: { agent_id: defaultAgentId },
      query
    }
  }
  return { name: 'AgentComp', query }
}

const goToThemeChat = async () => {
  const branch = knowledgePathStore.activeBranch
  if (!branch) return

  knowledgePathStore.setHandoff({
    target: 'chat',
    label: '带着当前路径进入问答'
  })
  sessionStorage.setItem(KNOWLEDGE_PATH_HANDOFF_KEY, '1')

  if (!userStore.isLoggedIn) {
    syncThemeContextFromBranch(branch)
    const fallbackTarget = {
      name: 'AgentComp',
      query: themeContextStore.toRouteQuery(branch.context)
    }
    sessionStorage.setItem('redirect', router.resolve(fallbackTarget).fullPath)
    await router.push('/login')
    return
  }

  const target = await buildAgentLocation(branch)
  await router.push(target)
}

const switchTheme = async (themeId) => {
  if (!hasKnowledgePathAdapter(themeId)) return
  await router.push({ path: `/knowledge/${themeId}` })
}

const ensureWorkbenchData = async () => {
  await infoStore.loadInfoConfig()

  if (!hasThemeId.value || !isThemeSupported.value || !currentThemeAdapter.value) {
    knowledgePathStore.reset()
    questionDraft.value = getKnowledgePathDefaultQuestion(currentThemeId.value)
    return
  }

  const canReuseCurrentState =
    knowledgePathStore.themeId === currentThemeId.value &&
    knowledgePathStore.hasBranches &&
    (!incomingQuestion.value || incomingQuestion.value === knowledgePathStore.rootQuestion)

  if (canReuseCurrentState) {
    questionDraft.value = knowledgePathStore.rootQuestion
    syncThemeContextFromBranch(knowledgePathStore.activeBranch)
    return
  }

  questionDraft.value =
    incomingQuestion.value || knowledgePathStore.questionDraft || getKnowledgePathDefaultQuestion(currentThemeId.value)

  await generateBaseKnowledgePath()
}

watch(
  () => route.fullPath,
  async () => {
    await ensureWorkbenchData()
  }
)

onMounted(async () => {
  await ensureWorkbenchData()
})
</script>

<style scoped lang="less">
.knowledgePath-workbench {
  min-height: 100vh;
  padding: 18px 20px 30px;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--main-100) 24%, transparent), transparent 28%),
    linear-gradient(180deg, #f4fbff, #eef5fb);
}

.workbench-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  max-width: 1680px;
  margin: 0 auto 12px;
}

.header-copy h1 {
  margin: 0;
  color: var(--gray-1000);
  font-size: clamp(1.9rem, 3.6vw, 2.8rem);
}

.header-subtitle {
  margin: 10px 0 0;
  max-width: 720px;
  color: var(--gray-600);
  line-height: 1.8;
}

.eyebrow {
  margin: 0 0 7px;
  color: var(--main-600);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-link {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--gray-150) 84%, transparent);
  background: color-mix(in srgb, var(--gray-0) 88%, transparent);
  color: var(--gray-700);
  text-decoration: none;
  font-weight: 600;
}

.module-strip {
  max-width: 1680px;
  margin: 0 auto 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.module-pill {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--gray-150) 82%, transparent);
  background: color-mix(in srgb, var(--gray-0) 90%, transparent);
  color: var(--gray-700);
  font-weight: 700;
  cursor: pointer;
}

.module-pill.active {
  background: color-mix(in srgb, var(--main-30) 84%, var(--gray-0));
  color: var(--main-800);
  border-color: color-mix(in srgb, var(--main-400) 60%, transparent);
}

.workbench-shell {
  max-width: 1680px;
  margin: 0 auto;
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.82fr);
  gap: 18px;
}

.stage-column,
.insight-column {
  display: grid;
  gap: 16px;
}

.stage-panel,
.dialogue-panel,
.selection-brief,
.insight-card,
.unsupported-card {
  border-radius: 24px;
  border: 1px solid color-mix(in srgb, var(--gray-120) 90%, transparent);
  background: color-mix(in srgb, var(--gray-0) 92%, transparent);
  box-shadow: 0 24px 56px color-mix(in srgb, var(--gray-1000) 6%, transparent);
  backdrop-filter: blur(18px);
}

.selection-brief {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
}

.brief-tag {
  margin: 0;
  color: var(--main-600);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brief-title {
  margin: 8px 0 0;
  color: var(--gray-1000);
  font-weight: 700;
}

.brief-chip,
.insight-count {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--main-30) 80%, var(--gray-0));
  color: var(--main-700);
  font-size: 12px;
  font-weight: 700;
}

.dialogue-panel {
  padding: 18px;
}

.dialogue-head strong {
  color: var(--gray-1000);
  font-size: 1rem;
}

.dialogue-hint {
  margin: 8px 0 0;
  color: var(--gray-600);
  line-height: 1.8;
}

.dialogue-input-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  margin-top: 16px;
}

.dialogue-input {
  min-height: 46px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--gray-150) 90%, transparent);
  padding: 0 14px;
  background: color-mix(in srgb, var(--gray-0) 96%, transparent);
  color: var(--gray-900);
}

.dialogue-send,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 16px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.dialogue-send {
  border: none;
  background: linear-gradient(135deg, var(--main-600), var(--main-500));
  color: var(--gray-0);
}

.secondary-btn {
  border: 1px solid color-mix(in srgb, var(--main-300) 58%, transparent);
  background: color-mix(in srgb, var(--gray-0) 92%, transparent);
  color: var(--gray-800);
}

.dialogue-actions {
  margin-top: 14px;
}

.insight-card {
  padding: 18px;
}

.insight-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.insight-head h2 {
  margin: 0;
  color: var(--gray-1000);
  font-size: 1.06rem;
}

.summary-copy,
.empty-copy {
  margin: 14px 0 0;
  color: var(--gray-600);
  line-height: 1.8;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag-list span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--main-20) 82%, transparent);
  color: var(--main-700);
  font-size: 12px;
  font-weight: 700;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.meta-item {
  padding: 12px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--main-10) 84%, transparent);
}

.meta-item span {
  display: block;
  color: var(--gray-500);
  font-size: 12px;
}

.meta-item strong {
  display: block;
  margin-top: 8px;
  color: var(--gray-1000);
}

.evidence-list,
.action-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.evidence-item,
.action-item {
  padding: 14px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--gray-0) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--gray-120) 82%, transparent);
}

.evidence-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.evidence-top strong,
.action-item strong {
  color: var(--gray-1000);
}

.evidence-top span {
  color: var(--main-700);
  font-size: 12px;
  font-weight: 700;
}

.evidence-item p,
.action-item p,
.unsupported-description {
  margin: 10px 0 0;
  color: var(--gray-600);
  line-height: 1.7;
}

.unsupported-shell {
  padding-top: 40px;
}

.unsupported-card {
  max-width: 720px;
  margin: 0 auto;
  padding: 28px;
}

.unsupported-card h2 {
  margin: 0;
  color: var(--gray-1000);
}

.unsupported-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

@media (max-width: 1180px) {
  .workbench-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .workbench-header,
  .selection-brief,
  .insight-head {
    flex-direction: column;
  }

  .dialogue-input-wrap,
  .meta-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .knowledgePath-workbench {
    padding: 16px;
  }
}
</style>
