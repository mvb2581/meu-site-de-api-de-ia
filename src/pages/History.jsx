import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { readWatchHistory, subscribeWatchHistory } from '../storage/watchHistory.js'

function episodeUrl(item) {
  const season = item.seasonId ?? item.season
  const episode = item.episodeNumber ?? item.episode
  return `/animes/${item.animeId}?${new URLSearchParams({ season: String(season), episode: String(episode) })}`
}

export default function History() {
  const [history, setHistory] = useState(readWatchHistory)

  useEffect(() => subscribeWatchHistory(() => setHistory(readWatchHistory())), [])

  return (
    <section className="container py-5">
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <p className="au-hero-kicker small mb-1">SUA ATIVIDADE</p>
          <h1 className="h2 fw-bold mb-0">Histórico</h1>
          <p className="text-muted mb-0">Disponível somente neste navegador.</p>
        </div>
        <Link to="/animes" className="btn au-btn-ghost btn-sm">Explorar animes</Link>
      </div>

      {!history.length ? (
        <div className="au-empty-state text-center py-5">
          <i className="bi bi-clock-history display-4 d-block mb-3" aria-hidden="true" />
          <h2 className="h5 fw-bold">Seu histórico está vazio</h2>
          <p className="text-muted mb-3">Os episódios que você iniciar aparecerão aqui.</p>
          <Link to="/animes" className="btn au-btn-primary">Encontrar um anime</Link>
        </div>
      ) : (
        <div className="d-grid gap-3">
          {history.map((item, index) => {
            const episode = item.episodeNumber ?? item.episode
            const season = item.seasonTitle || `Temporada ${item.season || 1}`
            const percentage = Math.min(100, Math.max(0, Number(item.percentage) || 0))
            return (
              <Link className="au-history-row" to={episodeUrl(item)} key={`${item.animeId}-${item.seasonId ?? item.season}-${episode}-${index}`}>
                <img src={item.animeImage} alt="" className="au-history-image" loading="lazy" />
                <div className="flex-grow-1 min-w-0">
                  <h2 className="h6 fw-bold text-truncate mb-1">{item.animeTitle}</h2>
                  <p className="small text-muted text-truncate mb-2">{season} · Episódio {episode}: {item.episodeTitle}</p>
                  <div className="au-history-progress" role="progressbar" aria-label={`Progresso do episódio: ${percentage}%`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage}>
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                </div>
                <span className={`au-history-status ${item.completed ? 'is-complete' : ''}`}>
                  {item.completed ? 'Concluído' : `${percentage}%`}
                </span>
                <i className="bi bi-play-circle au-history-action" aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
