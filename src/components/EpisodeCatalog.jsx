import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAnimeStreamingEpisodes } from '../api/anilist.js'
import { EPISODE_CONFIG } from '../api/episodes.js'
import YouTubePlayer from './YouTubePlayer.jsx'
import { findEpisodeProgress, saveEpisodeProgress, WATCH_HISTORY_CONFIG } from '../storage/watchHistory.js'

export default function EpisodeCatalog({ anime }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const seasonOptions = useMemo(() => {
    const all = [
      ...(anime.relations || []).filter((season) => season.format === 'TV' && ['PREQUEL', 'SEQUEL', 'PARENT', 'SIDE_STORY'].includes(season.relationType)),
      { id: anime.id, title: anime.title, year: anime.year, streamingEpisodes: anime.streamingEpisodes, current: true }
    ]
    return [...new Map(all.filter((season) => season.id).map((season) => [season.id, season])).values()]
      .sort((a, b) => (a.year || 0) - (b.year || 0))
  }, [anime])
  const [seasonId, setSeasonId] = useState(String(anime.id))
  const [selectedPlayback, setSelectedPlayback] = useState(null)
  const [initialPosition, setInitialPosition] = useState(0)
  const [episodesBySeason, setEpisodesBySeason] = useState(() => new Map([[String(anime.id), anime.streamingEpisodes || []]]))
  const [seasonLoading, setSeasonLoading] = useState(false)
  const [seasonError, setSeasonError] = useState('')
  const [visibleLimit, setVisibleLimit] = useState(EPISODE_CONFIG.MAX_EPISODES_INITIAL)
  const selectedSeason = seasonOptions.find((season) => String(season.id) === seasonId) || seasonOptions.at(-1) || anime
  const episodes = [...(episodesBySeason.get(String(selectedSeason.id)) || [])].sort((a, b) => a.number - b.number)
  const selectedIndex = episodes.findIndex((episode) => episode.number === selectedPlayback?.number)

  useEffect(() => {
    setSeasonId(String(anime.id))
    setSelectedPlayback(null)
    setInitialPosition(0)
    setVisibleLimit(EPISODE_CONFIG.MAX_EPISODES_INITIAL)
    setEpisodesBySeason(new Map([[String(anime.id), anime.streamingEpisodes || []]]))
  }, [anime.id])

  useEffect(() => {
    const key = String(selectedSeason.id)
    if (episodesBySeason.has(key)) {
      setSeasonLoading(false)
      setSeasonError('')
      return
    }
    const controller = new AbortController()
    setSeasonLoading(true)
    setSeasonError('')
    getAnimeStreamingEpisodes(selectedSeason.id, { signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) setEpisodesBySeason((current) => new Map(current).set(key, items))
      })
      .catch((error) => {
        if (!controller.signal.aborted) setSeasonError(typeof error === 'string' ? error : 'Não foi possível carregar esta temporada.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setSeasonLoading(false)
      })
    return () => controller.abort()
  }, [episodesBySeason, selectedSeason.id])

  useEffect(() => {
    const requestedEpisode = Number(searchParams.get('episode'))
    const requestedSeason = searchParams.get('season')
    if (!requestedEpisode || !requestedSeason) return
    const season = seasonOptions.find((item) => String(item.id) === requestedSeason)
    if (!season) return
    if (String(season.id) !== seasonId) setSeasonId(String(season.id))
    const seasonEpisodes = episodesBySeason.get(String(season.id))
    if (!seasonEpisodes) return
    const episode = seasonEpisodes.find((item) => item.number === requestedEpisode)
    if (!episode) return
    setSelectedPlayback((current) => current?.url === episode.url ? current : episode)
    const progress = findEpisodeProgress(anime.id, season.id, episode.number)
    setInitialPosition(progress?.completed ? 0 : progress?.position || 0)
  }, [anime.id, episodesBySeason, searchParams, seasonId, seasonOptions])

  const updateAddress = (season, episode) => {
    setSearchParams({ season: String(season.id), episode: String(episode.number) }, { replace: true })
  }

  const playEpisode = (episode) => {
    const progress = findEpisodeProgress(anime.id, selectedSeason.id, episode.number)
    setSeasonId(String(selectedSeason.id))
    setInitialPosition(progress?.completed ? 0 : progress?.position || 0)
    setSelectedPlayback(episode)
    updateAddress(selectedSeason, episode)
  }

  const handleSeason = (event) => {
    const nextSeasonId = event.target.value
    setSeasonId(nextSeasonId)
    setSelectedPlayback(null)
    setInitialPosition(0)
    setVisibleLimit(EPISODE_CONFIG.MAX_EPISODES_INITIAL)
    setSearchParams({}, { replace: true })
  }

  const saveProgress = (progress) => {
    if (!selectedPlayback) return
    saveEpisodeProgress(anime, selectedSeason, selectedPlayback, progress)
  }

  const handleEnded = () => {
    if (!WATCH_HISTORY_CONFIG.AUTOPLAY_NEXT_EPISODE) return
    const nextEpisode = episodes[selectedIndex + 1]
    if (nextEpisode) playEpisode(nextEpisode)
  }

  const seasonLabel = (season) => {
    const index = seasonOptions.findIndex((item) => item.id === season.id)
    return `Temporada ${index + 1}`
  }

  return (
    <section className="card au-panel mb-4" id="episodios" aria-labelledby="episodes-heading">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <h2 id="episodes-heading" className="h5 fw-bold mb-1"><i className="bi bi-collection-play me-2" aria-hidden="true" />Episódios disponíveis para assistir</h2>
            <p className="small text-muted mb-0">A lista mostra somente vídeos compatíveis com o player incorporado.</p>
          </div>
          {seasonOptions.length > 1 && (
            <select className="form-select au-input w-auto" value={seasonId} onChange={handleSeason} aria-label="Selecionar temporada">
              {seasonOptions.map((season) => <option key={season.id} value={season.id}>{seasonLabel(season)} · {season.title}</option>)}
            </select>
          )}
        </div>

        {!seasonLoading && !seasonError && episodes.length === 0 && <p className="small text-muted mb-0">Não há episódios incorporados disponíveis para este anime.</p>}
        {seasonLoading && <p className="small text-muted mb-0" role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Carregando episódios desta temporada…</p>}
        {seasonError && <p className="small text-warning mb-0" role="alert">{seasonError}</p>}

        {selectedPlayback && (
          <div className="au-episode-player mb-4">
            <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
              <h3 className="h6 fw-bold mb-0">{selectedPlayback.title}</h3>
              <button type="button" className="btn-close btn-close-white" aria-label="Fechar player" onClick={() => setSelectedPlayback(null)} />
            </div>
            <YouTubePlayer
              key={selectedPlayback.embedUrl}
              videoId={new URL(selectedPlayback.embedUrl).pathname.split('/').filter(Boolean).at(-1)}
              title={`${selectedSeason.title} — ${selectedPlayback.title}`}
              initialPosition={initialPosition}
              onProgress={saveProgress}
              onEnded={handleEnded}
            />
            <div className="au-episode-nav mt-3">
              <button type="button" className="btn au-btn-ghost btn-sm" disabled={selectedIndex <= 0} onClick={() => playEpisode(episodes[selectedIndex - 1])}>
                <i className="bi bi-skip-backward-fill me-1" aria-hidden="true" /> Episódio anterior
              </button>
              <button type="button" className="btn au-btn-ghost btn-sm" disabled={selectedIndex < 0 || selectedIndex >= episodes.length - 1} onClick={() => playEpisode(episodes[selectedIndex + 1])}>
                Próximo episódio <i className="bi bi-skip-forward-fill ms-1" aria-hidden="true" />
              </button>
            </div>
            <p className="small text-muted mt-2 mb-0">
              O progresso é salvo neste navegador; um episódio conta como concluído após {WATCH_HISTORY_CONFIG.WATCHED_THRESHOLD}% assistido.
            </p>
          </div>
        )}

        {episodes.length > 0 && (
          <div className="list-group au-episode-list">
            {episodes.slice(0, visibleLimit).map((episode) => (
              <div className={`list-group-item au-episode-row ${selectedPlayback?.number === episode.number ? 'is-playing' : ''}`} key={`${selectedSeason.id}-${episode.number}-${episode.url}`}>
                <div className="d-flex align-items-center gap-3">
                  <span className="au-episode-number">{episode.number}</span>
                  <div className="flex-grow-1 min-w-0">
                    <strong className="d-block text-truncate">{episode.title}</strong>
                    <small className="text-muted">Vídeo incorporável · {episode.site || 'YouTube'}</small>
                  </div>
                  <button type="button" className="btn btn-sm au-btn-primary" onClick={() => playEpisode(episode)} aria-label={`Reproduzir episódio ${episode.number} nesta página`}>
                    <i className="bi bi-play-fill me-1" aria-hidden="true" />Assistir aqui
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {episodes.length > visibleLimit && (
          <button type="button" className="btn au-btn-ghost w-100 mt-3" onClick={() => setVisibleLimit((limit) => Math.min(limit + EPISODE_CONFIG.MAX_EPISODES_PER_REQUEST, episodes.length))}>
            Carregar mais episódios
          </button>
        )}
        {episodes.length > 0 && <p className="small text-muted mt-3 mb-0">Os controles do player permitem tela cheia, volume, velocidade, legendas e qualidade quando disponíveis no vídeo.</p>}
      </div>
    </section>
  )
}
