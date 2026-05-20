<template>
  <div class="knowledgePath-hub-view">
    <section class="workspace-shell">
      <header class="workspace-header">
        <div class="workspace-copy">
          <p class="eyebrow">KNOWLEDGE WORKSPACE</p>
          <h1>蓝海智询知识路径工作台</h1>
          <p class="subtitle">先选模块，再生成一条围绕监测、诊断和决策展开的知识路径。</p>
        </div>

        <div class="header-actions">
          <router-link class="ghost-link" to="/themes">知识模块</router-link>
          <a
            v-if="docsUrl"
            class="ghost-link"
            :href="docsUrl"
            target="_blank"
            rel="noopener noreferrer"
          >产品仓库</a>
        </div>
      </header>

      <main class="workspace-main">
        <section class="workspace-panel controller-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">模块选择</p>
              <h2>选择一个水生动物疾病模块，生成首条知识路径</h2>
            </div>
            <span class="panel-badge">{{ themes.length }} 个模块</span>
          </div>

          <div v-if="hasAvailableThemes" class="module-strip" role="tablist" aria-label="蓝海智询模块">
            <button
              v-for="theme in themes"
              :key="theme.id"
              class="module-pill"
              :class="{ active: theme.id === selectedThemeId }"
              type="button"
              @click="selectTheme(theme.id)"
            >
              <span class="module-pill-title">{{ theme.name }}</span>
              <small>{{ theme.subtitle || '知识模块' }}</small>
            </button>
          </div>

          <div v-else class="empty-state">
            当前没有已接入知识路径适配器的模块。
          </div>

          <div class="question-panel">
            <label class="question-label" for="knowledgePath-hub-question">问诊起点</label>
            <textarea
              id="knowledgePath-hub-question"
              v-model="questionDraft"
              class="question-input"
              rows="4"
              :placeholder="placeholderQuestion"
            />

            <div class="question-actions">
              <button
                class="primary-button"
                :class="{ disabled: !activeThemeSupported }"
                type="button"
                :disabled="!activeThemeSupported"
                @click="openWorkbench()"
              >
                生成知识路径
              </button>
              <button
                v-if="canResumeCurrentTheme"
                class="secondary-button"
                type="button"
                @click="resumeCurrentTheme()"
              >
                继续上次路径
              </button>
            </div>
          </div>
        </section>

        <aside class="workspace-panel module-panel">
          <div class="module-card">
            <p class="eyebrow">当前模块</p>
            <h3>{{ activeTheme?.name || '未选择模块' }}</h3>
            <p class="module-description">
              {{ compactThemeDescription }}
            </p>

            <div v-if="compactHighlights.length" class="highlight-list">
              <div v-for="item in compactHighlights" :key="item" class="highlight-item">
                {{ item }}
              </div>
            </div>

            <div v-if="compactTags.length" class="tag-list">
              <span v-for="tag in compactTags" :key="tag">{{ tag }}</span>
            </div>

            <details
              v-if="remainingHighlights.length || remainingTags.length || activeTheme?.description"
              class="more-details"
            >
              <summary>查看更多模块信息</summary>
              <p v-if="activeTheme?.description">{{ activeTheme.description }}</p>
              <div v-if="remainingHighlights.length" class="highlight-list">
                <div v-for="item in remainingHighlights" :key="item" class="highlight-item">
                  {{ item }}
                </div>
              </div>
              <div v-if="remainingTags.length" class="tag-list">
                <span v-for="tag in remainingTags" :key="tag">{{ tag }}</span>
              </div>
            </details>
          </div>
        </aside>
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInfoStore } from '@/stores/info'
import { useKnowledgePathContextStore } from '@/stores/knowledgeContext'
import { getKnowledgePathDefaultQuestion, hasKnowledgePathAdapter } from '@/data/knowledge'

const router = useRouter()
const infoStore = useInfoStore()
const knowledgePathStore = useKnowledgePathContextStore()

const questionDraft = ref('')
const selectedThemeId = ref('')
const fallbackQuestion =
  '请描述你关心的宿主、症状、环境波动或用药场景，系统会先给出一条首层疾病知识路径。'

const themes = computed(() => (infoStore.themes || []).filter((theme) => hasKnowledgePathAdapter(theme.id)))
const docsUrl = computed(() => infoStore.projectRepoUrl || '')
const hasAvailableThemes = computed(() => themes.value.length > 0)
const activeTheme = computed(
  () => themes.value.find((theme) => theme.id === selectedThemeId.value) || themes.value[0] || null
)
const activeThemeSupported = computed(() => Boolean(activeTheme.value?.id))
const compactThemeDescription = computed(() => {
  const description = (activeTheme.value?.description || '').trim()
  if (!description) {
    return '围绕当前模块先生成一条疾病知识路径，再继续带着上下文问答。'
  }
  return description.length > 72 ? `${description.slice(0, 71)}…` : description
})
const compactHighlights = computed(() => (activeTheme.value?.highlights || []).slice(0, 2))
const remainingHighlights = computed(() => (activeTheme.value?.highlights || []).slice(2))
const compactTags = computed(() => (activeTheme.value?.tags || []).slice(0, 3))
const remainingTags = computed(() => (activeTheme.value?.tags || []).slice(3))
const placeholderQuestion = computed(() =>
  getKnowledgePathDefaultQuestion(activeTheme.value?.id || selectedThemeId.value || '', fallbackQuestion)
)
const canResumeCurrentTheme = computed(
  () =>
    activeThemeSupported.value &&
    knowledgePathStore.hasBranches &&
    knowledgePathStore.themeId &&
    knowledgePathStore.themeId === selectedThemeId.value
)

const ensureSelectedTheme = () => {
  if (selectedThemeId.value) {
    return
  }

  const storedThemeId =
    knowledgePathStore.themeId && themes.value.some((theme) => theme.id === knowledgePathStore.themeId)
      ? knowledgePathStore.themeId
      : ''
  const primaryThemeId =
    infoStore.primaryTheme?.id && hasKnowledgePathAdapter(infoStore.primaryTheme.id)
      ? infoStore.primaryTheme.id
      : ''

  selectedThemeId.value = storedThemeId || primaryThemeId || themes.value[0]?.id || ''
}

const syncQuestionDraft = (themeId = selectedThemeId.value, { preserveExisting = false } = {}) => {
  if (preserveExisting && questionDraft.value) {
    return
  }

  if (knowledgePathStore.themeId && knowledgePathStore.themeId === themeId) {
    questionDraft.value = knowledgePathStore.questionDraft || knowledgePathStore.rootQuestion || ''
  }

  if (questionDraft.value) {
    return
  }

  questionDraft.value = getKnowledgePathDefaultQuestion(themeId, fallbackQuestion)
}

const selectTheme = (themeId) => {
  selectedThemeId.value = themeId
  syncQuestionDraft(themeId)
}

const buildWorkbenchLocation = () => {
  const targetThemeId = selectedThemeId.value || themes.value[0]?.id || ''

  return {
    path: targetThemeId ? `/knowledge/${targetThemeId}` : '/knowledge',
    query: questionDraft.value.trim() ? { question: questionDraft.value.trim() } : {}
  }
}

const openWorkbench = async () => {
  if (!activeThemeSupported.value) {
    return
  }

  await router.push(buildWorkbenchLocation())
}

const resumeCurrentTheme = async () => {
  if (!activeThemeSupported.value) {
    return
  }

  await router.push({
    path: `/knowledge/${selectedThemeId.value || activeTheme.value?.id || ''}`
  })
}

watch(themes, () => {
  ensureSelectedTheme()
  syncQuestionDraft(selectedThemeId.value, { preserveExisting: true })
})

watch(selectedThemeId, (themeId, previousThemeId) => {
  if (!themeId || themeId === previousThemeId) {
    return
  }

  syncQuestionDraft(themeId)
})

onMounted(async () => {
  await infoStore.loadInfoConfig()
  ensureSelectedTheme()
  syncQuestionDraft(selectedThemeId.value, { preserveExisting: true })
})
</script>

<style scoped lang="less">
.knowledgePath-hub-view {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--main-100) 40%, transparent), transparent 36%),
    radial-gradient(circle at top right, color-mix(in srgb, var(--main-200) 18%, transparent), transparent 28%),
    linear-gradient(180deg, #f4fbff, #eef5fb);
}

.workspace-shell {
  max-width: 1480px;
  margin: 0 auto;
  padding: 28px 28px 56px;
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.workspace-copy h1 {
  margin: 0;
  color: var(--gray-1000);
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  letter-spacing: 0;
}

.subtitle {
  max-width: 560px;
  margin: 10px 0 0;
  color: var(--gray-600);
  line-height: 1.8;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--main-600);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ghost-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--gray-150) 90%, transparent);
  background: color-mix(in srgb, var(--gray-0) 84%, transparent);
  color: var(--gray-700);
  text-decoration: none;
  font-weight: 600;
}

.workspace-main {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.85fr);
  gap: 18px;
}

.workspace-panel {
  border: 1px solid color-mix(in srgb, var(--gray-120) 88%, transparent);
  border-radius: 28px;
  background: color-mix(in srgb, var(--gray-0) 92%, transparent);
  box-shadow: 0 24px 56px color-mix(in srgb, var(--gray-1000) 6%, transparent);
  backdrop-filter: blur(18px);
}

.controller-panel {
  padding: 24px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-head h2 {
  margin: 0;
  color: var(--gray-1000);
  font-size: 1.4rem;
}

.panel-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--main-30) 80%, var(--gray-0));
  color: var(--main-700);
  font-size: 12px;
  font-weight: 700;
}

.module-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.module-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--gray-150) 82%, transparent);
  background: color-mix(in srgb, var(--gray-0) 86%, transparent);
  color: var(--gray-700);
  text-align: left;
  cursor: pointer;
}

.module-pill.active {
  border-color: color-mix(in srgb, var(--main-500) 55%, transparent);
  background: color-mix(in srgb, var(--main-20) 84%, var(--gray-0));
  color: var(--gray-1000);
  box-shadow: 0 16px 32px color-mix(in srgb, var(--main-600) 12%, transparent);
}

.module-pill-title {
  font-size: 1rem;
  font-weight: 700;
}

.module-pill small {
  color: var(--gray-500);
}

.question-panel {
  margin-top: 24px;
  padding: 18px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--main-10) 88%, var(--gray-0));
}

.question-label {
  display: block;
  margin-bottom: 10px;
  color: var(--gray-800);
  font-size: 13px;
  font-weight: 700;
}

.question-input {
  width: 100%;
  min-height: 128px;
  resize: vertical;
  border: 1px solid color-mix(in srgb, var(--gray-150) 90%, transparent);
  border-radius: 16px;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--gray-0) 94%, transparent);
  color: var(--gray-900);
  line-height: 1.7;
}

.question-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  border: none;
  background: linear-gradient(135deg, var(--main-600), var(--main-500));
  color: var(--gray-0);
}

.primary-button.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.secondary-button {
  border: 1px solid color-mix(in srgb, var(--main-300) 55%, transparent);
  background: color-mix(in srgb, var(--gray-0) 90%, transparent);
  color: var(--gray-800);
}

.module-panel {
  padding: 22px;
}

.module-card {
  border-radius: 22px;
  padding: 20px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--gray-0) 96%, transparent), var(--main-10));
  min-height: 100%;
}

.module-card h3 {
  margin: 0;
  color: var(--gray-1000);
  font-size: 1.4rem;
}

.module-description {
  margin: 14px 0 0;
  color: var(--gray-600);
  line-height: 1.8;
}

.highlight-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.highlight-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--main-20) 86%, transparent);
  color: var(--gray-800);
  line-height: 1.7;
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
  background: color-mix(in srgb, var(--gray-50) 92%, transparent);
  color: var(--main-700);
  font-size: 12px;
  font-weight: 700;
}

.more-details {
  margin-top: 16px;
  color: var(--gray-600);
}

.more-details summary {
  cursor: pointer;
  color: var(--main-700);
  font-weight: 700;
}

.empty-state {
  margin-top: 20px;
  padding: 24px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--main-10) 76%, transparent);
  color: var(--gray-600);
}

@media (max-width: 1080px) {
  .workspace-main,
  .module-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .workspace-shell {
    padding: 20px 16px 40px;
  }

  .workspace-header,
  .panel-head {
    flex-direction: column;
  }
}
</style>
