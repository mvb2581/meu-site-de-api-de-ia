import { Link } from 'react-router-dom'
import { readWatchHistory, subscribeWatchHistory, WATCH_HISTORY_CONFIG } from '../storage/watchHistory.js'
import { useEffect, useState } from 'react'

function episodeUrl(item) {
  const season = item.seasonId ?? item.season
  const episode = item.episodeNumber ?? item.episode
  const query = new URLSearchParams({ season: String(season), episode: String(episode) })
  return `/animes/${item.animeId}?${query}`
}

export default function ContinueWatching() {
  const [history, setHistory] = useState(readWatchHistory)

  useEffect(() => subscribeWatchHistory(() => setHistory(readWatchHistory())), [])

  const items = history
    .filter((item) => !item.completed && Number(item.percentage) < WATCH_HISTORY_CONFIG.WATCHED_THRESHOLD)
    .slice(0, WATCH_HISTORY_CONFIG.MAX_CONTINUE_WATCHING)

  if (!items.length) return null

  return (
    <section className="container py-4" aria-labelledby="continue-watching-title">
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <p className="au-hero-kicker small mb-1">RETOME DE ONDE PAROU</p>
          <h2 id="continue-watching-title" className="h3 fw-bold mb-0">Continue assistindo</h2>
        </div>
        <Link to="/historico" className="btn au-btn-ghost btn-sm text-nowrap">
          Ver histórico <i className="bi bi-chevron-right" aria-hidden="true" />
        </Link>
      </div>
      <div className="row g-3">
        {items.map((item) => (
          <div className="col-6 col-md-4 col-lg-3" key={`${item.animeId}-${item.seasonId ?? item.season}-${item.episodeNumber ?? item.episode}`}>
            <Link className="au-continue-card" to={episodeUrl(item)}>
              <div className="au-continue-image-wrap">
                <img src={item.animeImage} alt="" className="au-continue-image" loading="lazy" />
                <span className="au-continue-play" aria-hidden="true"><i className="bi bi-play-fill" /></span>
                <div className="au-continue-progress" role="progressbar" aria-label={`Progresso: ${item.percentage || 0}%`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={item.percentage || 0}>
                  <span style={{ width: `${Math.min(100, Math.max(0, Number(item.percentage) || 0))}%` }} />
                </div>
              </div>
              <div className="pt-2">
                <h3 className="h6 fw-bold text-truncate mb-1">{item.animeTitle}</h3>
                <p className="small text-muted text-truncate mb-0">
                  {item.seasonTitle || `Temporada ${item.season || 1}`} · Ep. {item.episodeNumber ?? item.episode}: {item.episodeTitle}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
