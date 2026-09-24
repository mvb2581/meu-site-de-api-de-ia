import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAnimeFull, clearCache } from '../api/anilist.js'
import { CATALOG_ANIME } from '../data/catalog.js'
import AnimeCard from '../components/AnimeCard.jsx'
import JImage from '../components/JImage.jsx'

const STATUS_PT = {
  FINISHED: 'Finalizado',
  RELEASING: 'Em exibição',
  NOT_YET_RELEASED: 'Em breve',
  CANCELLED: 'Cancelado'
}

export default function AnimeDetail() {
  const { id } = useParams()
  const catalogEntry = CATALOG_ANIME.find((a) => String(a.id) === id)
  const [live, setLive] = useState(null)
  const [failed, setFailed] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLive(null)
    setFailed(false)
    getAnimeFull(id)
      .then((d) => alive && setLive(d))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [id, tick])

  const anime = live || catalogEntry || null
  const offline = !live && !!catalogEntry

  if (!anime) {
    if (failed) {
      return (
        <div className="container py-5">
          <div className="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span><i className="bi bi-exclamation-triangle me-1" /> Não foi possível carregar este título agora.</span>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => {
                clearCache()
                setTick((t) => t + 1)
              }}
            >
              <i className="bi bi-arrow-clockwise me-1" /> Tentar novamente
            </button>
          </div>
          <Link to="/animes" className="btn au-btn-primary">Voltar ao catálogo</Link>
        </div>
      )
    }
    return (
      <div className="container py-5">
        <div className="au-skeleton-row">
          <div className="au-skeleton au-skeleton-hero" />
          <div className="au-skeleton au-skeleton-wide" />
          <div className="au-skeleton au-skeleton-wide" />
        </div>
      </div>
    )
  }

  const recs = live?.recs?.length
    ? live.recs
    : CATALOG_ANIME.filter((a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g)))
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 6)

  const heroStyle = anime.banner
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(11,14,26,0.78) 30%, rgba(20,26,51,0.45)), url(${anime.banner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : undefined

  const stats = [
    anime.score && { icon: 'star-fill', label: 'Nota', value: `${anime.score}/100` },
    anime.episodes && { icon: 'collection-play', label: 'Episódios', value: anime.episodes },
    anime.duration && { icon: 'clock', label: 'Duração', value: `${anime.duration} min` },
    anime.year && { icon: 'calendar2-check', label: 'Lançamento', value: anime.year }
  ].filter(Boolean)

  return (
    <div className="container py-5">
      <Link to="/animes" className="btn au-btn-ghost btn-sm mb-3">
        <i className="bi bi-arrow-left me-1" /> Catálogo
      </Link>

      <section className="au-anime-hero card border-0 overflow-hidden mb-4">
        <div className="au-anime-hero-bg" style={heroStyle}>
          <div className="row g-0 align-items-center">
            <div className="col-md-3">
              <JImage src={anime.image} alt={anime.title} className="img-fluid w-100" fallbackLabel="Sem capa" />
            </div>
            <div className="col-md-9 p-4 p-md-5 text-white">
              <p className="au-hero-kicker mb-1">
                {(STATUS_PT[anime.status] || anime.status || '') + (anime.season ? ` · ${anime.season}` : '')}
                {anime.year ? ` ${anime.year}` : ''}
              </p>
              <h1 className="h2 fw-bold mb-1">{anime.title}</h1>
              <p className="text-white-50 small mb-3">{anime.titleJp && <span>{anime.titleJp} · </span>}{anime.studio}</p>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {anime.genres.map((g) => (
                  <Link key={g} to={`/animes?genero=${encodeURIComponent(g)}`} className="au-tag text-decoration-none">{g}</Link>
                ))}
              </div>
              <div className="d-flex flex-wrap gap-3 small text-white-50 mb-0">
                {stats.map((s) => (
                  <span key={s.label}>
                    <i className={`bi bi-${s.icon} me-1 au-link`} /> {s.label}: <strong className="text-white">{s.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {offline && (
        <div className="alert alert-info py-2 small">
          <i className="bi bi-info-circle me-1" />
          Exibindo dados locais sincronizados com a comunidade. Dados ao vivo indisponíveis no momento.
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <section className="card au-panel mb-4">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-2"><i className="bi bi-journal-text me-1" /> Sinopse</h2>
              <p className="text-secondary small lh-lg mb-0">{anime.synopsis || 'Sem sinopse disponível.'}</p>
            </div>
          </section>

          {anime.trailer && (
            <section className="mb-4">
              <h2 className="h5 fw-bold mb-2"><i className="bi bi-play-btn me-1" /> Trailer</h2>
              <div className="au-trailer ratio ratio-16x9 rounded-3 overflow-hidden">
                <iframe
                  title="Trailer"
                  src={`https://www.youtube.com/embed/${anime.trailer}`}
                  allowFullScreen
                />
              </div>
            </section>
          )}

          <section className="card au-panel">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3"><i className="bi bi-people me-1" /> Personagens principais</h2>
              {(!anime.characters || anime.characters.length === 0) ? (
                <p className="text-muted small mb-0">Sem personagens listados.</p>
              ) : (
                <div className="row g-3">
                  {anime.characters.slice(0, 12).map((c) => (
                    <div className="col-6 col-md-4 col-lg-3" key={c.id}>
                      <Link to={`/personagens/${c.id}`} className="text-decoration-none">
                        <div className="au-role-card">
                          <JImage
                            src={c.image}
                            alt={c.name}
                            className="img-fluid w-100 rounded-circle au-role-avatar"
                            fallbackLabel="?"
                          />
                          <h6 className="au-role-name">{c.name}</h6>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="col-lg-4">
          <section className="card au-panel mb-4">
            <div className="card-body">
              <h3 className="h6 fw-bold mb-3"><i className="bi bi-info-circle me-1" /> Ficha</h3>
              <dl className="row small mb-0 au-ficha">
                <dt className="col-5 text-muted">Formato</dt>
                <dd className="col-7">{anime.format || '—'}</dd>
                <dt className="col-5 text-muted">Episódios</dt>
                <dd className="col-7">{anime.episodes ?? 'Em andamento'}</dd>
                <dt className="col-5 text-muted">Duração</dt>
                <dd className="col-7">{anime.duration ? `${anime.duration} min` : '—'}</dd>
                <dt className="col-5 text-muted">Status</dt>
                <dd className="col-7">{STATUS_PT[anime.status] || anime.status || '—'}</dd>
                <dt className="col-5 text-muted">Lançamento</dt>
                <dd className="col-7">{`${anime.season || ''} ${anime.year || ''}`.trim() || '—'}</dd>
                <dt className="col-5 text-muted">Estúdio</dt>
                <dd className="col-7">{anime.studio || '—'}</dd>
              </dl>
            </div>
          </section>

          {recs.length > 0 && (
            <section>
              <h3 className="h5 fw-bold mb-3"><i className="bi bi-hand-thumbs-up me-1" /> Recomendados</h3>
              <div className="row g-3">
                {recs.map((r) => (
                  <div className="col-4 col-md-3 col-lg-4" key={r.id}>
                    <AnimeCard anime={r} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}