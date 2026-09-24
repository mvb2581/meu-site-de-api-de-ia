import { useEffect, useState } from 'react'
import { BANNERS } from '../data/media.js'
import { searchAnime, topAnime, bestBanner } from '../api/anilist.js'

const LS_KEY = 'aurex_custom_banners'

function loadCustom() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || []
  } catch {
    return []
  }
}

export default function BannerPicker({ value, onChange }) {
  const [customs, setCustoms] = useState(loadCustom)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    topAnime('POPULARITY_DESC', 12)
      .then((r) => alive && setResults(r))
      .catch(() => alive && setError('Fonte ao vivo indisponível no momento — você ainda pode usar os banners padrão.'))
      .finally(() => alive && setLoaded(true))
    return () => {
      alive = false
    }
  }, [])

  const addCustom = (src) => {
    const next = customs.includes(src) ? customs : [...customs, src]
    setCustoms(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    onChange(src)
  }

  const runSearch = async (q) => {
    const term = q ?? query
    if (!term.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await searchAnime(term, 12)
      setResults(res)
      setLoaded(true)
    } catch (err) {
      setError(err.message || 'Fonte ao vivo indisponível no momento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h6 className="fw-bold mb-2"><i className="bi bi-image me-1" /> Escolha o banner do perfil</h6>

      <div className="d-flex gap-2 mb-3">
        <div className="input-group">
          <span className="input-group-text au-input-group"><i className="bi bi-search" /></span>
          <input
            className="form-control au-input"
            placeholder="Buscar anime para usar como banner..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          />
        </div>
        <button className="btn au-btn-primary text-nowrap" onClick={() => runSearch()} disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm" /> : 'Buscar'}
        </button>
      </div>

      {error && <div className="alert alert-warning py-2 small">{error}</div>}

      {loaded && (
        <>
          <p className="small text-muted mb-2 fw-semibold">
            Animes encontrados — clique para usar como banner
          </p>
          <div className="row g-2 mb-4">
            {results.map((r) => {
              const src = bestBanner(r)
              return (
                <div className="col-6 col-md-4" key={r.id}>
                  <button
                    type="button"
                    className={`au-banner-opt w-100 ${value === src ? 'au-banner-selected' : ''}`}
                    onClick={() => src && addCustom(src)}
                    title={r.title}
                  >
                    <img src={src} alt={r.title} className="img-fluid w-100" loading="lazy" />
                    <small className="au-thumb-label d-block text-truncate">
                      {r.title} {r.year ? `(${r.year})` : ''}
                    </small>
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {customs.length > 0 && (
        <>
          <p className="small text-muted mb-2 fw-semibold">Banners escolhidos</p>
          <div className="row g-2 mb-4">
            {customs.map((src, i) => (
              <div className="col-6 col-md-4" key={`c${i}`}>
                <button
                  type="button"
                  className={`au-banner-opt w-100 ${value === src ? 'au-banner-selected' : ''}`}
                  onClick={() => onChange(src)}
                  title="Usar este banner"
                >
                  <img src={src} alt={`Banner ${i + 1}`} className="img-fluid w-100" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="small text-muted mb-2 fw-semibold">Banners padrão</p>
      <div className="row g-2">
        {BANNERS.map((src, i) => (
          <div className="col-6 col-md-4" key={`p${i}`}>
            <button
              type="button"
              className={`au-banner-opt w-100 ${value === src ? 'au-banner-selected' : ''}`}
              onClick={() => onChange(src)}
              title="Usar este banner"
            >
              <img src={src} alt={`Banner ${i + 1}`} className="img-fluid w-100" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}