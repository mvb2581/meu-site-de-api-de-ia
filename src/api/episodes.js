export const EPISODE_CONFIG = Object.freeze({
  MAX_EPISODES_PER_REQUEST: 24,
  MAX_SEARCH_RESULTS: 5,
  REQUEST_TIMEOUT: 9000,
  MAX_RETRIES: 2,
  CACHE_DURATION: 6 * 60 * 60 * 1000,
  MIN_EXPECTED_EPISODES: 1,
  MAX_EPISODES_INITIAL: 12,
  MAX_CACHE_ENTRIES: 100,
  RETRY_INTERVAL: 900,
  JIKAN_BASE_URL: 'https://api.jikan.moe/v4'
})

const cache = new Map()
const pending = new Map()
const pause = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) return reject(new DOMException('Busca cancelada.', 'AbortError'))
  const timer = setTimeout(() => {
    signal?.removeEventListener('abort', abort)
    resolve()
  }, ms)
  function abort() {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
    reject(new DOMException('Busca cancelada.', 'AbortError'))
  }
  signal?.addEventListener('abort', abort, { once: true })
})

export function normalizeAnimeTitle(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(\d+(st|nd|rd|th)\s+)?season\s*\d*\b|\bseason\s*\d+\b|\b\d+(st|nd|rd|th)\s+season\b/gi, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function animeTitleSimilarity(a, b) {
  const left = normalizeAnimeTitle(a)
  const right = normalizeAnimeTitle(b)
  if (!left || !right) return 0
  if (left === right) return 1
  const aTokens = new Set(left.split(' '))
  const bTokens = new Set(right.split(' '))
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length
  return (2 * overlap) / (aTokens.size + bTokens.size)
}

async function requestJson(url, signal, attempt = 0) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, EPISODE_CONFIG.REQUEST_TIMEOUT)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (response.status === 429 || response.status >= 500) {
      if (attempt < EPISODE_CONFIG.MAX_RETRIES) {
        await pause(EPISODE_CONFIG.RETRY_INTERVAL * (attempt + 1), signal)
        return requestJson(url, signal, attempt + 1)
      }
    }
    if (!response.ok) throw new Error(response.status === 404 ? 'Episódios não encontrados.' : `Jikan respondeu HTTP ${response.status}.`)
    return response.json()
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}

function memoized(key, loader) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < EPISODE_CONFIG.CACHE_DURATION) {
    cache.delete(key)
    cache.set(key, hit)
    return Promise.resolve(hit.data)
  }
  if (hit) cache.delete(key)
  if (pending.has(key)) return pending.get(key)
  const promise = loader().then((data) => {
    cache.set(key, { at: Date.now(), data })
    while (cache.size > EPISODE_CONFIG.MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value)
    return data
  }).finally(() => pending.delete(key))
  pending.set(key, promise)
  return promise
}

async function lookupMalId(anime, signal) {
  if (anime.idMal) return anime.idMal
  const candidates = [anime.titleJp, ...(anime.synonyms || []), anime.title].filter(Boolean)
  for (const title of [...new Set(candidates)]) {
    const q = encodeURIComponent(title)
    try {
      const result = await requestJson(`${EPISODE_CONFIG.JIKAN_BASE_URL}/anime?q=${q}&limit=${EPISODE_CONFIG.MAX_SEARCH_RESULTS}`, signal)
      const matches = result.data || []
      const exact = matches
        .map((item) => ({ item, score: Math.max(animeTitleSimilarity(title, item.title), animeTitleSimilarity(title, item.title_english || ''), animeTitleSimilarity(title, item.title_japanese || '')) }))
        .sort((a, b) => b.score - a.score)[0]
      if (exact?.score >= 0.68) return exact.item.mal_id
    } catch (error) {
      if (error.name === 'AbortError') throw error
    }
  }
  return null
}

export async function getAnimeEpisodes(anime, { page = 1, signal } = {}) {
  const cacheKey = `episodes:${anime.id}:${page}`
  return memoized(cacheKey, async () => {
    const malId = await memoized(`mal:${anime.id}`, () => lookupMalId(anime, signal))
    if (!malId) return { episodes: [], page, hasNextPage: false, source: 'none', message: 'Não foi possível encontrar este anime na fonte de episódios.' }
    const offset = (page - 1) * EPISODE_CONFIG.MAX_EPISODES_PER_REQUEST
    const providerPage = Math.floor(offset / 100) + 1
    const pageOffset = offset % 100
    const url = `${EPISODE_CONFIG.JIKAN_BASE_URL}/anime/${malId}/episodes?page=${providerPage}`
    const result = await memoized(`jikan:${malId}:${providerPage}`, () => requestJson(url, signal))
    const pageItems = (result.data || []).slice(pageOffset, pageOffset + EPISODE_CONFIG.MAX_EPISODES_PER_REQUEST)
    const episodes = pageItems.map((episode) => ({
      id: episode.mal_id,
      number: episode.mal_id,
      title: episode.title || `Episódio ${episode.mal_id}`,
      titleJapanese: episode.title_japanese || '',
      aired: episode.aired || null,
      score: episode.score || null,
      filler: Boolean(episode.filler),
      recap: Boolean(episode.recap),
      url: episode.url || null
    }))
    return {
      episodes,
      page,
      hasNextPage: offset + episodes.length < (result.pagination?.items?.total || 0),
      source: 'Jikan',
      malId,
      streamingEpisodes: (anime.streamingEpisodes || []).map((stream) => ({
        ...stream,
        episodeNumber: Number(stream.title?.match(/(?:episode|ep\.?|#)\s*(\d+)/i)?.[1]) || null
      }))
    }
  })
}

export function clearEpisodeCache() {
  cache.clear()
}
