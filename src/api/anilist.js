const ENDPOINT = 'https://graphql.anilist.co'
const SPACING = 2500
const TIMEOUT = 15000
const TTL = 24 * 60 * 60 * 1000
const MAX_ENTRIES = 100
const LS_KEY = 'aurex_a_cache_v2'

const mem = new Map()
let chain = Promise.resolve()
const inflight = new Map()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function readLs() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw)
    return p?.map || {}
  } catch {
    return {}
  }
}

function persistLs(map) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ v: 1, map }))
  } catch {
    // sem espaço no storage: ignora
  }
}

function cached(key) {
  const hit = mem.has(key) ? mem.get(key) : readLs()[key]
  return hit || null
}

function save(key, data) {
  const rec = { at: Date.now(), data }
  mem.set(key, rec)
  const ls = readLs()
  const keys = Object.keys(ls)
  if (keys.length >= MAX_ENTRIES) {
    const oldest = key
      .split('|')
      .sort((a, b) => (ls[a]?.at || 0) - (ls[b]?.at || 0))
      .slice(0, Math.max(0, keys.length - MAX_ENTRIES + 1))
    oldest.forEach((k) => delete ls[k])
  }
  ls[key] = { at: rec.at, data }
  persistLs(ls)
}

const strip = (html, max = 1800) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

function friendly(err) {
  if (err?.friendly) return err.friendly
  if (err?.name === 'AbortError') return 'A busca demorou demais. Verifique sua conexão e tente novamente.'
  return 'Não foi possível acessar a fonte de dados agora. Tente novamente em instantes.'
}

async function fetchGql(query, variables, attempt = 0) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT)
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: ctrl.signal
    })
  } finally {
    clearTimeout(timer)
  }
  if (res.status === 429 && attempt < 3) {
    await sleep(4000 + attempt * 3000)
    return fetchGql(query, variables, attempt + 1)
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    err.retryable = [429, 500, 502, 503, 504].includes(res.status)
    err.friendly =
      res.status === 429
        ? 'A fonte de dados limitou as requisições. Aguarde alguns segundos e tente novamente.'
        : res.status === 504
          ? 'A fonte de dados está temporariamente fora do ar. Tente novamente em instantes.'
          : `Erro na fonte de dados (${res.status}).`
    throw err
  }
  const j = await res.json()
  if (j.errors) {
    const err = new Error(j.errors[0]?.message || 'Erro na fonte de dados.')
    err.friendly = friendly(err)
    throw err
  }
  return j.data
}

function run(key, query, variables) {
  if (inflight.has(key)) return inflight.get(key)
  const enqueued = chain.then(() => fetchGql(query, variables))
  chain = enqueued.then(() => sleep(SPACING), () => sleep(SPACING))
  const done = enqueued
    .catch((e) => {
      inflight.delete(key)
      throw e
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, done)
  return done
}

async function request(key, query, variables, wrap) {
  const hit = cached(key)
  const fresh = hit && Date.now() - hit.at < TTL ? hit.data : null
  if (fresh) return fresh
  try {
    const data = await run(key, query, variables)
    const out = wrap ? wrap(data) : data
    save(key, out)
    return out
  } catch (e) {
    if (hit) return hit.data
    throw friendly(e)
  }
}

const M = `
  id
  title { romaji english }
  coverImage { extraLarge large }
  bannerImage
  description(asHtml: true)
  genres
  averageScore
  episodes
  duration
  format
  status
  season
  seasonYear
  studios(isMain: true) { nodes { name } }
  trailer { site id }`

const media = (m) => ({
  id: m.id,
  title: m.title?.english || m.title?.romaji || 'Sem título',
  titleJp: m.title?.romaji || '',
  image: m.coverImage?.extraLarge || m.coverImage?.large || '',
  banner: m.bannerImage || '',
  synopsis: strip(m.description),
  genres: m.genres || [],
  score: m.averageScore || null,
  episodes: m.episodes ?? null,
  duration: m.duration || null,
  format: m.format || 'TV',
  status: m.status || '',
  season: m.season || '',
  year: m.seasonYear || null,
  studio: (m.studios?.nodes || []).map((n) => n.name).join(', '),
  trailer: m.trailer?.site === 'youtube' ? m.trailer.id : null
})

const PAGE_MEDIA = `
query($q:String, $pg:Int, $sort:[MediaSort], $genre:String, $season:MediaSeason, $seasYear:Int){
  Page(perPage:$pg){
    media(search:$q, type:ANIME, isAdult:false, sort:$sort, genre:$genre, season:$season, seasonYear:$seasYear){
      ${M}
    }
  }
}`

export function searchAnime(q, perPage = 24) {
  const key = `sa|${q.toLowerCase()}|${perPage}`
  return request(key, PAGE_MEDIA, { q, pg: perPage, sort: ['SEARCH_MATCH'] }, (d) =>
    (d.Page?.media || []).map(media)
  )
}

export function topAnime(sort = 'TRENDING_DESC', perPage = 12) {
  const key = `ta|${sort}|${perPage}`
  return request(key, PAGE_MEDIA, { pg: perPage, sort: [sort] }, (d) =>
    (d.Page?.media || []).map(media)
  )
}

export function genreAnime(genre, perPage = 24) {
  const key = `ga|${genre}|${perPage}`
  return request(key, PAGE_MEDIA, { genre, pg: perPage, sort: ['POPULARITY_DESC'] }, (d) =>
    (d.Page?.media || []).map(media)
  )
}

const SEASON = { 1: 'WINTER', 4: 'SPRING', 7: 'SUMMER', 10: 'FALL' }

export function seasonAnime(perPage = 12) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const season = SEASON[Math.floor((month - 1) / 3) * 3 + 1]
  const key = `se|${season}|${year}|${perPage}`
  return request(key, PAGE_MEDIA, { season, seasYear: year, pg: perPage, sort: ['POPULARITY_DESC'] }, (d) =>
    (d.Page?.media || []).map(media)
  )
}

const ANIME_FULL = `
query($id:Int){
  Media(id:$id, type:ANIME){
    ${M}
    characters(perPage:12, role:MAIN){
      edges { role node { id name { full } image { large } } }
    }
    recommendations(perPage:8, sort:[RATING_DESC]){
      nodes { mediaRecommendation { id title { romaji english } coverImage { large } } }
    }
  }
}`

export function getAnimeFull(id) {
  const key = `af|${id}`
  return request(key, ANIME_FULL, { id }, (d) => {
    const m = d.Media
    if (!m) throw 'Anime não encontrado.'
    const hero = media(m)
    hero.characters = (m.characters?.edges || []).map((e) => ({
      id: e.node.id,
      name: e.node.name?.full || '—',
      image: e.node.image?.large || '',
      role: e.role
    }))
    hero.recs = (m.recommendations?.nodes || [])
      .map((r) => r.mediaRecommendation)
      .filter(Boolean)
      .map(media)
    return hero
  })
}

const CHAR_FIELDS = `
  id
  name { full native }
  image { large }
  favourites`

const PAGE_CHAR = `
query($q:String, $pg:Int){
  Page(perPage:$pg){
    characters(search:$q, sort:FAVOURITES_DESC){
      ${CHAR_FIELDS}
    }
  }
}`

const character = (c) => ({
  id: c.id,
  name: c.name?.full || '—',
  native: c.name?.native || '',
  image: c.image?.large || '',
  favourites: c.favourites || 0
})

export function searchCharacters(q, perPage = 24) {
  const key = `sc|${q.toLowerCase()}|${perPage}`
  return request(key, PAGE_CHAR, { q, pg: perPage }, (d) =>
    (d.Page?.characters || []).map(character)
  )
}

export function topCharacters(perPage = 24) {
  const key = `tc|${perPage}`
  return request(key, PAGE_CHAR, { pg: perPage }, (d) =>
    (d.Page?.characters || []).map(character)
  )
}

const CHAR_FULL = `
query($id:Int){
  Character(id:$id){
    id
    name { full native }
    image { large }
    description(asHtml: true)
    favourites
    age
    gender
    media(sort:POPULARITY_DESC, perPage:9){
      edges {
        characterRole
        voiceActors(language:JAPANESE){ id name { full } image { large } }
        node { id title { romaji english } coverImage { large } format }
      }
    }
  }
}`

export function getCharacterFull(id) {
  const key = `cf|${id}`
  return request(key, CHAR_FULL, { id }, (d) => {
    const c = d.Character
    if (!c) throw 'Personagem não encontrado.'
    const voices = new Map()
    const animeography = (c.media?.edges || [])
      .filter((e) => e.node?.format === 'TV' || e.node?.format === 'MOVIE')
      .map((e) => {
        ;(e.voiceActors || []).forEach((v) => voices.set(v.id, v))
        return {
          id: e.node.id,
          title: e.node.title?.english || e.node.title?.romaji || '—',
          image: e.node.coverImage?.large || '',
          role: e.characterRole
        }
      })
    return {
      id: c.id,
      name: c.name?.full || '—',
      native: c.name?.native || '',
      image: c.image?.large || '',
      favourites: c.favourites || 0,
      age: c.age,
      gender: c.gender,
      about: c.description || '',
      animeography,
      voices: [...voices.values()].slice(0, 8).map((v) => ({
        id: v.id,
        name: v.name?.full || '—',
        image: v.image?.large || ''
      }))
    }
  })
}

export function animeTitle(a) {
  return a?.title || '—'
}

export function animeImage(a) {
  return a?.image || ''
}

export function characterImage(c) {
  return c?.image || ''
}

export function clearCache() {
  mem.clear()
  try {
    localStorage.removeItem('aurex_a_cache_v2')
    localStorage.removeItem('aurex_a_cache')
  } catch {
    // ignora
  }
}

export function bestBanner(a) {
  return a?.banner || a?.image || ''
}