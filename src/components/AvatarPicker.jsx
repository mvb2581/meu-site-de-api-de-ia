import { useEffect, useState } from 'react'
import { AVATARS } from '../data/media.js'
import { searchCharacters, topCharacters } from '../api/anilist.js'

const LS_KEY = 'aurex_custom_avatars'

function loadCustom() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || []
  } catch {
    return []
  }
}

export default function AvatarPicker({ value, onChange, title = 'Escolha sua foto de perfil' }) {
  const [customs, setCustoms] = useState(loadCustom)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    topCharacters(18)
      .then((r) => alive && setResults(r))
      .catch(() => alive && setError('Fonte ao vivo indisponível no momento — você ainda pode usar os avatares padrão.'))
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
      const res = await searchCharacters(term, 18)
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
      <h6 className="fw-bold mb-2"><i className="bi bi-person-badge me-1" /> {title}</h6>

      <div className="d-flex gap-2 mb-3">
        <div className="input-group">
          <span className="input-group-text au-input-group"><i className="bi bi-search" /></span>
          <input
            className="form-control au-input"
            placeholder="Buscar personagem de anime..."
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
            Personagens encontrados ({results.length})
          </p>
          <div className="row g-2 mb-4">
            {results.map((r) => (
              <div className="col-4 col-sm-3 col-md-2" key={r.id}>
                <button
                  type="button"
                  className={`au-avatar-opt w-100 ${value === r.image ? 'au-avatar-selected' : ''}`}
                  onClick={() => addCustom(r.image)}
                  title={r.name}
                >
                  <img src={r.image} alt={r.name} className="img-fluid rounded-circle" loading="lazy" />
                  <small className="au-thumb-label d-block text-truncate">{r.name}</small>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {customs.length > 0 && (
        <>
          <p className="small text-muted mb-2 fw-semibold">O que você já escolheu</p>
          <div className="row g-2 mb-4">
            {customs.map((src, i) => (
              <div className="col-3 col-md-2" key={`c${i}`}>
                <button
                  type="button"
                  className={`au-avatar-opt w-100 ${value === src ? 'au-avatar-selected' : ''}`}
                  onClick={() => onChange(src)}
                  title="Usar este avatar"
                >
                  <img src={src} alt={`Escolhido ${i + 1}`} className="img-fluid rounded-circle" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="small text-muted mb-2 fw-semibold">Avatares padrão</p>
      <div className="row g-2">
        {AVATARS.map((src, i) => (
          <div className="col-3 col-md-2" key={`p${i}`}>
            <button
              type="button"
              className={`au-avatar-opt w-100 ${value === src ? 'au-avatar-selected' : ''}`}
              onClick={() => onChange(src)}
              title="Usar este avatar"
            >
              <img src={src} alt={`Opção ${i + 1}`} className="img-fluid rounded-circle" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}