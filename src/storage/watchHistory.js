export const WATCH_HISTORY_CONFIG = Object.freeze({
  WATCHED_THRESHOLD: 90,
  MAX_HISTORY_ITEMS: 50,
  MAX_CONTINUE_WATCHING: 8,
  AUTOPLAY_NEXT_EPISODE: true
})

const HISTORY_KEY = 'aurex_continue_watching_v1'
const CHANGE_EVENT = 'aurex:watch-history-change'

export function readWatchHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function findEpisodeProgress(animeId, seasonId, episodeNumber) {
  return readWatchHistory().find((entry) =>
    String(entry.animeId) === String(animeId) &&
    String(entry.seasonId ?? entry.season) === String(seasonId) &&
    Number(entry.episodeNumber ?? entry.episode) === Number(episodeNumber)
  ) || null
}

export function saveEpisodeProgress(anime, season, episode, { position = 0, duration = 0 } = {}) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const safePosition = Math.max(0, Math.min(Number(position) || 0, safeDuration || Number(position) || 0))
  const percentage = safeDuration ? Math.min(100, Math.round((safePosition / safeDuration) * 100)) : 0
  const completed = percentage >= WATCH_HISTORY_CONFIG.WATCHED_THRESHOLD
  const entry = {
    animeId: anime.id,
    animeTitle: anime.title,
    animeImage: anime.image,
    seasonId: season.id,
    seasonTitle: season.title || 'Temporada',
    episodeNumber: episode.number,
    episodeTitle: episode.title,
    position: safePosition,
    duration: safeDuration || null,
    percentage,
    completed,
    updatedAt: Date.now()
  }
  const key = `${entry.animeId}:${entry.seasonId}:${entry.episodeNumber}`
  const history = [entry, ...readWatchHistory().filter((item) =>
    `${item.animeId}:${item.seasonId ?? item.season}:${item.episodeNumber ?? item.episode}` !== key
  )].slice(0, WATCH_HISTORY_CONFIG.MAX_HISTORY_ITEMS)

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // O player continua funcionando mesmo quando o armazenamento local está indisponível.
  }
  return entry
}

export function subscribeWatchHistory(callback) {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
