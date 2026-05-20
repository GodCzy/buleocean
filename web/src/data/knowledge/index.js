import { fishAtlasKnowledgePathAdapter } from '@/data/knowledge/fishAtlasKnowledgePathAdapter'
import { marineRagKnowledgePathAdapter } from '@/data/knowledge/marineRagKnowledgePathAdapter'
import { vectorVaultKnowledgePathAdapter } from '@/data/knowledge/vectorVaultKnowledgePathAdapter'

const knowledgePathAdapters = {
  [fishAtlasKnowledgePathAdapter.id]: fishAtlasKnowledgePathAdapter,
  [marineRagKnowledgePathAdapter.id]: marineRagKnowledgePathAdapter,
  [vectorVaultKnowledgePathAdapter.id]: vectorVaultKnowledgePathAdapter
}

const normalizeThemeId = (value = '') =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const getRegisteredAdapters = () => Object.values(knowledgePathAdapters)

const resolveViewAdapter = (themeId = '') => {
  const normalizedThemeId = normalizeThemeId(themeId)
  if (normalizedThemeId) {
    return knowledgePathAdapters[normalizedThemeId] || null
  }

  return getRegisteredAdapters()[0] || null
}

const callAdapterMethod = (themeId = '', methodName = '', ...args) => {
  const adapter = resolveViewAdapter(themeId)
  const method = adapter?.[methodName]
  if (typeof method !== 'function') {
    return null
  }

  return method(...args)
}

export const resolveKnowledgePathAdapter = (themeId = '') =>
  knowledgePathAdapters[normalizeThemeId(themeId)] || null

export const hasKnowledgePathAdapter = (themeId = '') => Boolean(resolveKnowledgePathAdapter(themeId))

export const listKnowledgePathAdapterIds = () => Object.keys(knowledgePathAdapters)

export const getKnowledgePathDefaultQuestion = (
  themeId = '',
  fallback = '请描述你的目标、问题场景和检索重点，系统会先整理几条知识路径。'
) => resolveViewAdapter(themeId)?.defaultQuestion || fallback

export const getKnowledgePathDisplayLabel = (themeId = '', value = '') => {
  const label = callAdapterMethod(themeId, 'getDisplayLabel', value)
  return typeof label === 'string' ? label : value || ''
}

export const getKnowledgePathCardTitleById = (themeId = '', cardId = '') => {
  const title = callAdapterMethod(themeId, 'getCardTitleById', cardId)
  return typeof title === 'string' ? title : cardId || ''
}

export const getKnowledgePathManifestSummary = (themeId = '', fallback = { card_count: 0 }) => {
  const summary = callAdapterMethod(themeId, 'getManifestSummary')
  return summary && typeof summary === 'object' ? summary : fallback
}

export const getKnowledgePathRecommendationCandidates = (themeId = '') => {
  const candidates = callAdapterMethod(themeId, 'getRecommendationCandidates')
  return Array.isArray(candidates) ? candidates : []
}

export const getKnowledgePathGraphLoops = (themeId = '') => {
  const graphLoops = callAdapterMethod(themeId, 'getGraphLoops')
  return Array.isArray(graphLoops) ? graphLoops : []
}

export const getKnowledgePathGraphLoopById = (themeId = '', graphId = '') =>
  callAdapterMethod(themeId, 'getGraphLoopById', graphId) || null

export const getKnowledgePathGraphDefaultKeyword = (themeId = '', graphLoopOrGraphId = '') =>
  callAdapterMethod(themeId, 'getGraphDefaultKeyword', graphLoopOrGraphId) || ''

export const getKnowledgePathRecommendationCandidateById = (themeId = '', candidateId = '') =>
  callAdapterMethod(themeId, 'getRecommendationCandidateById', candidateId) || null

export const getKnowledgePathThemeShowcaseMeta = (themeId = '', fallback = null) =>
  callAdapterMethod(themeId, 'getThemeShowcaseMeta') || fallback

export const getKnowledgePathThemeShowcaseCandidates = (themeId = '') => {
  const items = callAdapterMethod(themeId, 'getThemeShowcaseCandidates')
  return Array.isArray(items) ? items : []
}

export const getKnowledgePathThemeShowcaseGraphs = (themeId = '') => {
  const items = callAdapterMethod(themeId, 'getThemeShowcaseGraphs')
  return Array.isArray(items) ? items : []
}

export const getKnowledgePathAgentContextView = (themeId = '', activeContext = {}) =>
  callAdapterMethod(themeId, 'getAgentContextView', activeContext) || null
