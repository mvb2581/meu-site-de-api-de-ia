export const MY_LIST_CONFIG = Object.freeze({ MAX_ITEMS: 100 })

const STORAGE_KEY = 'aurex_my_list_v1'
const CHANGE_EVENT = 'aurex:my-list-change'

export function readMyList() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function isInMyList(animeId) {
  return readMyList().some((anime) => String(anime.id) === String(animeId))
}

export function toggleMyList(anime) {
  const current = readMyList()
  const exists = current.some((item) => String(item.id) === String(anime.id))
  const next = (exists
    ? current.filter((item) => String(item.id) !== String(anime.id))
    : [{
        id: anime.id,
        title: anime.title,
        titleJp: anime.titleJp || '',
        image: anime.image || '',
        score: anime.score ?? null,
        format: anime.format || '',
        episodes: anime.episodes ?? null,
        year: anime.year ?? null,
        genres: Array.isArray(anime.genres) ? anime.genres.slice(0, 8) : []
      }, ...current]).slice(0, MY_LIST_CONFIG.MAX_ITEMS)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(CHANGE_EVENT))
    return { saved: !exists, ok: true }
  } catch {
    return { saved: exists, ok: false }
  }
}

export function subscribeMyList(callback) {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
