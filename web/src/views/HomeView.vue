<template>
  <div class="home-shell">
    <header class="topbar">
      <router-link to="/" class="brand-link">
        <img
          v-if="infoStore.organization.logo"
          :src="infoStore.organization.logo"
          :alt="infoStore.organization.name"
          class="brand-logo"
        >
        <div>
          <p class="brand-name">{{ infoStore.organization.name || '蓝海智询' }}</p>
          <span class="brand-subline">水生动物疾病知识问答工作台</span>
        </div>
      </router-link>

      <nav class="topbar-nav">
        <router-link class="nav-pill" to="/themes">知识模块</router-link>
        <router-link class="nav-pill" to="/knowledge">知识路径工作台</router-link>
        <a
          v-if="repoUrl"
          class="nav-pill"
          :href="repoUrl"
          target="_blank"
          rel="noopener noreferrer"
        >产品仓库</a>
      </nav>

      <UserInfoComponent :show-button="true" />
    </header>

    <main v-if="!isLoading" class="home-main">
      <section class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">BLUEOCEAN PLATFORM</p>
          <h1>{{ infoStore.branding.title || '蓝海智询：水生动物疾病知识问答平台' }}</h1>
          <p class="hero-subtitle">
            {{
              infoStore.branding.subtitle ||
              '面向病-药-环知识图谱、RAG 检索增强、动态问诊与环境预警的一体化前端工作台'
            }}
          </p>
          <p class="hero-description">
            {{
              infoStore.branding.description ||
              '把宿主、病原、药物、环境指标和监测记录组织成可追溯、可检索、可解释的智能诊断平台界面。'
            }}
          </p>

          <div class="hero-actions">
            <button class="primary-button" type="button" @click="goToWorkbench">
              进入知识路径工作台
              <ArrowRight :size="16" />
            </button>
            <button class="secondary-button" type="button" @click="goToThemes">查看模块矩阵</button>
          </div>

          <div class="hero-tags">
            <span v-for="tag in heroTags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="hero-preview">
          <div class="preview-window">
            <div class="preview-header">
              <div>
                <p class="preview-label">平台视图</p>
                <h2>监测 - 诊断 - 决策闭环</h2>
              </div>
              <span class="preview-chip">实时工作区</span>
            </div>

            <div class="preview-query">
              <span class="query-mark">Q</span>
              <p>石斑鱼出现体表摩擦和鳃丝苍白，近 48 小时氨氮升高，系统应优先排查什么病害并给出哪些处置建议？</p>
            </div>

            <div class="preview-grid">
              <article v-for="panel in previewPanels" :key="panel.title" class="preview-card">
                <div class="preview-card-head">
                  <component :is="panel.icon" :size="16" />
                  <strong>{{ panel.title }}</strong>
                </div>
                <p class="preview-card-main">{{ panel.main }}</p>
                <p class="preview-card-desc">{{ panel.description }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="stats-strip">
        <article v-for="card in featureCards" :key="card.label" class="stat-card">
          <div class="stat-head">
            <component :is="card.icon" :size="16" />
            <span>{{ card.label }}</span>
          </div>
          <strong>{{ card.value }}</strong>
          <p>{{ card.description }}</p>
        </article>
      </section>

      <section class="section-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">MODULES</p>
            <h2>蓝海智询模块矩阵</h2>
          </div>
          <p>以前端产品视图把病-药-环图谱、动态问诊与 RAG 问答、混合检索与环境预警三块能力串成一套完整平台。</p>
        </div>

        <div class="module-grid">
          <article v-for="theme in themes" :key="theme.id" class="module-card">
            <div class="module-card-head">
              <div>
                <span class="module-status">{{ theme.status }}</span>
                <h3>{{ theme.name }}</h3>
                <p>{{ theme.subtitle }}</p>
              </div>
              <button class="mini-action" type="button" @click="openTheme(theme)">进入</button>
            </div>

            <p class="module-description">{{ theme.description }}</p>

            <div class="module-tags">
              <span v-for="tag in theme.tags.slice(0, 4)" :key="tag">{{ tag }}</span>
            </div>

            <ul class="module-highlights">
              <li v-for="item in theme.highlights.slice(0, 2)" :key="item">{{ item }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <div>
            <p class="eyebrow">WORKFLOW</p>
            <h2>典型工作流程</h2>
          </div>
          <p>从监测输入到病害初筛，再到证据回答与环境预警，前端页面按同一套平台语义组织展示。</p>
        </div>

        <div class="workflow-grid">
          <article v-for="step in workflowSteps" :key="step.title" class="workflow-card">
            <div class="workflow-index">{{ step.index }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </article>
        </div>
      </section>
    </main>

    <div v-else class="loading-state">
      <div class="loading-dot"></div>
      <p>正在装载蓝海智询平台视图...</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Database, Network, ScanSearch, Files, ShieldCheck } from 'lucide-vue-next'
import { useInfoStore } from '@/stores/info'
import UserInfoComponent from '@/components/UserInfoComponent.vue'

const router = useRouter()
const infoStore = useInfoStore()
const isLoading = ref(true)

const themes = computed(() => infoStore.themes || [])
const featuredTheme = computed(() => infoStore.primaryTheme || themes.value[0] || null)
const repoUrl = computed(() => infoStore.projectRepoUrl || 'https://github.com/GodCzy/buleocean')

const heroTags = computed(() => {
  const activeThemeTags = featuredTheme.value?.tags || []
  return ['病-药-环图谱', '动态问诊', '混合检索', '48h 预警', ...activeThemeTags].slice(0, 6)
})

const iconMap = {
  stars: Network,
  resolved: ScanSearch,
  commits: Database,
  license: ShieldCheck
}

const featureCards = computed(() =>
  (infoStore.features || []).map((item) => ({
    ...item,
    icon: iconMap[item.icon] || Files
  }))
)

const previewPanels = [
  {
    title: '监测输入',
    main: '症状文本、图片观察、水温、盐度、氨氮进入统一问诊入口',
    description: '平台先接住监测信号，再决定走哪条疾病识别与检索路径。',
    icon: ScanSearch
  },
  {
    title: '问诊决策',
    main: '有限状态机驱动追问宿主、病程、环境波动和用药史',
    description: '把“先问清、再检索、后回答”的流程显式摆在界面里。',
    icon: Network
  },
  {
    title: '图谱联动',
    main: '病-药-环境三元关系把宿主、病原和处置依据串成知识链',
    description: '用知识图谱解释为什么怀疑某类病害，而不是只给结论。',
    icon: Database
  },
  {
    title: '证据回答',
    main: '仅引用命中文档、图谱节点和监测规则生成可解释答复',
    description: '回答保留 grounding、引用依据和继续追问入口，符合 RAG 闭环。',
    icon: ShieldCheck
  }
]

const workflowSteps = [
  {
    index: '01',
    title: '汇聚监测与病例线索',
    description: '先把宿主、症状、图片、环境波动和既往用药等线索纳入同一套疾病知识入口。'
  },
  {
    index: '02',
    title: '生成诊断与检索路径',
    description: '系统把问题组织成病-药-环图谱、混合召回、证据排序和动态追问的组合路径。'
  },
  {
    index: '03',
    title: '输出防治决策与预警',
    description: '把证据回答、处置建议和环境预警一起呈现，形成完整的监测 - 诊断 - 决策闭环。'
  }
]

const goToWorkbench = () => {
  router.push(featuredTheme.value?.id ? `/knowledge/${featuredTheme.value.id}` : '/knowledge')
}

const goToThemes = () => {
  router.push('/themes')
}

const openTheme = (theme) => {
  router.push(theme.entry_route || `/themes/${theme.id}`)
}

onMounted(async () => {
  await infoStore.loadInfoConfig()
  isLoading.value = false
})
</script>

<style scoped lang="less">
.home-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 24%),
    radial-gradient(circle at left center, rgba(14, 165, 233, 0.12), transparent 28%),
    linear-gradient(180deg, #f5fbff 0%, #eef5fb 44%, #f8fbfe 100%);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #0f172a;
  text-decoration: none;
}

.brand-logo {
  width: 34px;
  height: 34px;
}

.brand-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.brand-subline {
  color: #64748b;
  font-size: 12px;
}

.topbar-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nav-pill {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(255, 255, 255, 0.76);
  color: #334155;
  text-decoration: none;
  font-weight: 600;
}

.home-main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 30px 24px 64px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.95fr);
  gap: 22px;
  align-items: stretch;
}

.hero-copy,
.hero-preview,
.section-block,
.stat-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(18px);
}

.hero-copy {
  border-radius: 28px;
  padding: 34px;
}

.eyebrow {
  margin: 0 0 12px;
  color: #0284c7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.4rem, 4vw, 4rem);
  line-height: 1.02;
}

.hero-subtitle {
  margin: 18px 0 0;
  color: #1e293b;
  font-size: 1.15rem;
  line-height: 1.7;
}

.hero-description {
  margin: 16px 0 0;
  color: #475569;
  line-height: 1.85;
  max-width: 720px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.primary-button,
.secondary-button,
.mini-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.primary-button {
  border: none;
  padding: 0 18px;
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  color: #fff;
  box-shadow: 0 16px 30px rgba(2, 132, 199, 0.24);
}

.secondary-button,
.mini-action {
  border: 1px solid rgba(14, 116, 144, 0.2);
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.74);
  color: #0f172a;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.hero-tags span,
.module-tags span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(2, 132, 199, 0.08);
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

.hero-preview {
  border-radius: 28px;
  padding: 18px;
}

.preview-window {
  height: 100%;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.9));
  color: #e2e8f0;
  padding: 20px;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.preview-label {
  margin: 0;
  color: #38bdf8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-header h2 {
  margin: 8px 0 0;
  font-size: 1.2rem;
  color: #f8fafc;
}

.preview-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.14);
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 700;
}

.preview-query {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(15, 118, 110, 0.12);
}

.query-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(14, 165, 233, 0.2);
  color: #67e8f9;
  font-weight: 800;
}

.preview-query p {
  margin: 0;
  line-height: 1.7;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.preview-card {
  padding: 14px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.preview-card-head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #bae6fd;
}

.preview-card-main {
  margin: 14px 0 0;
  color: #f8fafc;
  font-weight: 700;
  line-height: 1.6;
}

.preview-card-desc {
  margin: 10px 0 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.7;
}

.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-card {
  border-radius: 22px;
  padding: 20px;
}

.stat-head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #0369a1;
  font-size: 13px;
  font-weight: 700;
}

.stat-card strong {
  display: block;
  margin-top: 14px;
  color: #0f172a;
  font-size: 1.35rem;
}

.stat-card p {
  margin: 10px 0 0;
  color: #475569;
  line-height: 1.7;
}

.section-block {
  margin-top: 20px;
  border-radius: 28px;
  padding: 26px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
}

.section-head h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.8rem;
}

.section-head p {
  margin: 0;
  color: #475569;
  max-width: 640px;
  line-height: 1.8;
}

.module-grid,
.workflow-grid {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.module-grid,
.workflow-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.module-card,
.workflow-card {
  border-radius: 22px;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(248, 250, 252, 0.86);
}

.module-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.module-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.1);
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

.module-card h3,
.workflow-card h3 {
  margin: 12px 0 0;
  color: #0f172a;
  font-size: 1.3rem;
}

.module-card p,
.workflow-card p {
  color: #475569;
  line-height: 1.8;
}

.module-description {
  margin-top: 16px;
}

.module-highlights {
  margin: 16px 0 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.8;
}

.workflow-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(2, 132, 199, 0.1);
  color: #0369a1;
  font-weight: 800;
}

.loading-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #475569;
}

.loading-dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #0284c7, #67e8f9);
  box-shadow: 0 0 0 10px rgba(2, 132, 199, 0.12);
}

@media (max-width: 1180px) {
  .hero-grid,
  .module-grid,
  .workflow-grid,
  .stats-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .topbar {
    padding: 16px;
    flex-wrap: wrap;
  }

  .home-main {
    padding: 20px 16px 40px;
  }

  .hero-copy,
  .hero-preview,
  .section-block {
    padding: 20px;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
