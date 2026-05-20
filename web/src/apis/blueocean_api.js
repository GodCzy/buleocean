import { apiGet, apiPost } from './base'

const unwrap = (response) => response?.data || response

export const blueOceanApi = {
  health: async () => unwrap(await apiGet('/api/blueocean/health', {}, false)),
  overview: async () => unwrap(await apiGet('/api/blueocean/overview', {}, false)),
  graph: async (focus = '') => {
    const query = focus ? `?focus=${encodeURIComponent(focus)}` : ''
    return unwrap(await apiGet(`/api/blueocean/graph${query}`, {}, false))
  },
  ask: async ({ question, host = '石斑鱼', top_k = 5 }) =>
    unwrap(await apiPost('/api/blueocean/ask', { question, host, top_k }, {}, false)),
  retrieval: async (query = '') => {
    const suffix = query ? `?query=${encodeURIComponent(query)}` : ''
    return unwrap(await apiGet(`/api/blueocean/retrieval${suffix}`, {}, false))
  },
  alerts: async () => unwrap(await apiGet('/api/blueocean/alerts', {}, false))
}
