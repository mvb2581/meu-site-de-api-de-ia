import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API = 'https://graphql.anilist.co'
const OUT = path.join(__dirname, '..', 'src', 'data', 'catalog.js')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function gql(query, variables, attempt = 0) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables })
  })
  if (res.status === 429 && attempt < 4) {
    await sleep(4000 + attempt * 3000)
    return gql(query, variables, attempt + 1)
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const j = await res.json()
  if (j.errors) throw new Error((j.errors[0]?.message || 'graphql error').slice(0, 160))
  return j.data
}

const SEARCHES = [
  // Action / battle
  'Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen', 'One Punch Man', 'Chainsaw Man',
  'My Hero Academia', 'Black Clover',
  // Adventure / shounen clássico
  'One Piece', 'Hunter x Hunter', 'Fullmetal Alchemist', 'Made in Abyss', 'Dr. Stone', 'Dragon Ball Z',
  // Comédia
  'Konosuba', 'Kaguya-sama', 'Grand Blue', 'Gintama', 'Daily Lives of High School Boys',
  'Bocchi the Rock', 'Spy x Family',
  // Drama
  'Violet Evergarden', 'March Comes in Like a Lion', 'Clannad', 'Anohana',
  // Fantasia / isekai
  'Frieren', 'Re:Zero', 'Mushoku Tensei', 'Solo Leveling', 'That Time I Got Reincarnated as a Slime',
  'No Game No Life',
  // Horror / thriller
  'Another', 'Tokyo Ghoul', 'Higurashi', 'Parasyte', 'Steins;Gate',
  // Mistério / psicológico
  'Death Note', 'Erased', 'Summertime Render', 'Monster', 'Psycho-Pass',
  // Romance
  'Toradora', 'Horimiya', 'Fruits Basket', 'My Dress-Up Darling', 'Oregairu',
  // Sci-fi
  'Cowboy Bebop', 'Neon Genesis Evangelion', 'Code Geass', '86 Eighty-Six', 'Vivy',
  // Slice of life
  'K-On', 'Laid-Back Camp', 'Hyouka', 'A Place Further than the Universe',
  // Esportes
  'Haikyu', 'Kuroko no Basket', 'Slam Dunk', 'Hajime no Ippo',
  // Sobrenatural
  'Mob Psycho 100', 'Noragami', 'Bleach', 'Death Parade',
  // Filmes
  'Your Name', 'Spirited Away', 'A Silent Voice', 'Weathering with You', 'Perfect Blue', 'Howl',
  // Mecha / música
  'Gurren Lagann', 'Given', 'Sound! Euphonium', 'Nana'
]

const MEDIA_Q = `
query($ids:[Int]){
  Page(perPage:50){
    media(id_in:$ids,type:ANIME){
      id
      title { romaji english }
      coverImage { extraLarge large }
      bannerImage
      description(asHtml:true)
      genres
      averageScore
      episodes
      duration
      format
      status
      season
      seasonYear
      studios(isMain:true){ nodes { name } }
      trailer { site id }
      characters(perPage:5,role:MAIN){ edges { node { id name { full } image { large } } } }
    }
  }
}`

const SEARCH_Q = `
query($s:String){ Page(perPage:1){ media(search:$s,type:ANIME,isAdult:false,sort:SEARCH_MATCH){ id } } }`

const strip = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()

async function main() {
  const ids = new Set()
  for (const q of SEARCHES) {
    try {
      const d = await gql(SEARCH_Q, { s: q })
      const m = d.Page.media[0]
      if (m) {
        ids.add(m.id)
      } else {
        console.log('sem resultado:', q)
      }
    } catch (e) {
      console.log('erro busca:', q, e.message)
    }
    await sleep(2300)
  }
  console.log('IDs únicos:', ids.size)

  const idList = [...ids]
  const anime = []
  const seenChars = new Map()

  for (let i = 0; i < idList.length; i += 30) {
    const chunk = idList.slice(i, i + 30)
    try {
      const d = await gql(MEDIA_Q, { ids: chunk })
      for (const m of d.Page.media || []) {
        const desc = strip(m.description)
        const entry = {
          id: m.id,
          title: m.title?.english || m.title?.romaji || 'Sem título',
          titleJp: m.title?.romaji || '',
          image: m.coverImage?.extraLarge || m.coverImage?.large,
          banner: m.bannerImage,
          synopsis: desc.slice(0, 320),
          genres: (m.genres || []).filter(Boolean),
          score: m.averageScore,
          episodes: m.episodes,
          duration: m.duration,
          format: m.format,
          season: m.season,
          year: m.seasonYear,
          studio: (m.studios?.nodes || []).map((s) => s.name).slice(0, 2).join(', ') || '',
          trailer: m.trailer?.site === 'youtube' ? m.trailer?.id : null,
          characters: (m.characters?.edges || []).map((e) => ({
            id: e.node.id,
            name: e.node.name?.full,
            image: e.node.image?.large
          }))
        }
        for (const c of entry.characters) {
          if (!seenChars.has(c.id) && c.image) seenChars.set(c.id, true)
        }
        anime.push(entry)
      }
    } catch (e) {
      console.log('erro lote', chunk[0], e.message)
    }
    await sleep(2300)
  }

  anime.sort((a, b) => (b.score || 0) - (a.score || 0))

  const characters = []
  const seen = new Set()
  for (const a of anime) {
    for (const c of a.characters) {
      if (!c.id || !c.image || seen.has(c.id)) continue
      seen.add(c.id)
      characters.push({ id: c.id, name: c.name, image: c.image, animeIds: [a.id] })
    }
  }

  const genres = [...new Set(anime.flatMap((a) => a.genres))].sort()

  const out = `// Gerado por scripts/gen-catalog.mjs — fonte: AniList API
export const GENRES = ${JSON.stringify(genres, null, 0)}

export const CATALOG_ANIME = ${JSON.stringify(anime, null, 0)}

export const CATALOG_CHARACTERS = ${JSON.stringify(characters, null, 0)}
`
  writeFileSync(OUT, out, 'utf8')
  console.log('Animes:', anime.length, '| Personagens:', characters.length, '| Gêneros:', genres.length)
  console.log('Arquivo:', OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})