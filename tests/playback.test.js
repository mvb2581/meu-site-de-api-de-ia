import test from 'node:test'
import assert from 'node:assert/strict'
import { embeddableEpisodes, youtubeEmbedUrl } from '../src/api/playback.js'
import { animeTitleSimilarity, normalizeAnimeTitle } from '../src/api/episodes.js'

test('normaliza títulos e remove qualificadores de temporada', () => {
  assert.equal(
    normalizeAnimeTitle('Boku no Hero Academia — 2nd Season'),
    normalizeAnimeTitle('Boku no Hero Academia Season 2')
  )
  assert.equal(normalizeAnimeTitle('  Café!  '), 'cafe')
  assert.equal(animeTitleSimilarity('Boku no Hero Academia 2nd Season', 'Boku no Hero Academia Season 2'), 1)
  assert.ok(animeTitleSimilarity('Blue', 'Blue Lock') < 0.68)
})

test('aceita somente links HTTPS válidos do YouTube para incorporação', () => {
  assert.equal(youtubeEmbedUrl('https://youtu.be/abcdefghijk'), 'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&playsinline=1&rel=0')
  assert.equal(youtubeEmbedUrl('http://youtube.com/watch?v=abcdefghijk'), null)
  assert.equal(youtubeEmbedUrl('https://vimeo.com/abcdefghijk'), null)
})

test('só lista vídeos incorporáveis com número de episódio identificável', () => {
  const result = embeddableEpisodes([
    { title: 'Episode 8: The Beginning', url: 'https://www.youtube.com/watch?v=abcdefghijk' },
    { title: 'Special feature', url: 'https://www.youtube.com/watch?v=lmnopqrstuv' },
    { title: 'Episode 9', url: 'https://example.com/video' }
  ])
  assert.equal(result.length, 1)
  assert.equal(result[0].number, 8)
})

test('salva progresso, detecta conclusão em 90% e mantém histórico limitado', async () => {
  const stored = new Map()
  const originalStorage = globalThis.localStorage
  const originalWindow = globalThis.window
  globalThis.localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value)
  }
  globalThis.window = { dispatchEvent() {} }
  try {
    const { findEpisodeProgress, readWatchHistory, saveEpisodeProgress, WATCH_HISTORY_CONFIG } = await import('../src/storage/watchHistory.js')
    const anime = { id: 42, title: 'Teste', image: '/cover.jpg' }
    const season = { id: 4, title: 'Temporada 1' }
    const episode = { number: 1, title: 'Começo' }
    saveEpisodeProgress(anime, season, episode, { position: 50, duration: 100 })
    assert.equal(findEpisodeProgress(42, 4, 1).percentage, 50)
    saveEpisodeProgress(anime, season, episode, { position: 90, duration: 100 })
    assert.equal(findEpisodeProgress(42, 4, 1).completed, true)
    assert.equal(findEpisodeProgress(42, 4, 1).percentage, WATCH_HISTORY_CONFIG.WATCHED_THRESHOLD)
    assert.equal(readWatchHistory().length, 1)

    for (let number = 2; number <= 51; number += 1) {
      saveEpisodeProgress(anime, season, { number, title: `Episódio ${number}` }, { position: 10, duration: 100 })
    }
    assert.equal(readWatchHistory().length, WATCH_HISTORY_CONFIG.MAX_HISTORY_ITEMS)
    assert.equal(findEpisodeProgress(42, 4, 1), null)

    const { readMyList, toggleMyList } = await import('../src/storage/myList.js')
    assert.deepEqual(toggleMyList(anime), { saved: true, ok: true })
    assert.equal(readMyList().length, 1)
    assert.deepEqual(toggleMyList(anime), { saved: false, ok: true })
    assert.equal(readMyList().length, 0)
  } finally {
    if (originalStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = originalStorage
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
  }
})
