import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchAnime, clearCache } from '../api/anilist.js'
import { CATALOG_ANIME, GENRES } from '../data/catalog.js'
import AnimeCard from '../components/AnimeCard.jsx'

const SORTS = [
  { id: 'score', label: 'Melhor nota' },
  { id: 'title', label: 'Ordem alfabética' }
]

export default function Animes() {
  const searchController = useRef(null)
  const [params, setParams] = useSearchParams()
  const paramGenre = params.get('genero') || ''
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('score')
  const [genre, setGenre] = useState(
    GENRES.some((g) => g === paramGenre) ? paramGenre : ''
  )
  const [live, setLive] = useState(null)
  const [liveError, setLiveError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => () => searchController.current?.abort(), [])

  const setName = (value) => {
    setGenre(value)
    if (value) setParams({ genero: value })
    else setParams({})
  }

  const submit = async (e) => {
    e.preventDefault()
    const q = query.trim()
    searchController.current?.abort()
    if (!q) {
      setLoading(false)
      setLive(null)
      setLiveError(false)
      return
    }
    setLoading(true)
    setLiveError(false)
    setLive(null)
    const controller = new AbortController()
    searchController.current = controller
    try {
      const res = await searchAnime(q, 36, { signal: controller.signal })
      if (!controller.signal.aborted) setLive(res)
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setLiveError(true)
        setLive(null)
      }
    } finally {
      if (searchController.current === controller) setLoading(false)
    }
  }

  const catalog = [...CATALOG_ANIME]
    .filter((a) => !genre || a.genres.includes(genre))
    .sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : (b.score || 0) - (a.score || 0))
    .slice(0, 60)

  const offlineMatches = query.trim()
    ? CATALOG_ANIME.filter((a) => a.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 36)
    : []

  const visible = query.trim() ? (live || offlineMatches) : catalog
  const isLive = query.trim() && !!live
  const showEmptyState = visible.length === 0

  return (
    <div className="container py-5">
      <header className="mb-4">
        <h1 className="h2 fw-bold">Catálogo de Animes</h1>
        <p className="text-muted">Explore por gênero ou busque por título.</p>
      </header>

      <form onSubmit={submit} className="row g-2 mb-3">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text au-input-group"><i className="bi bi-search" /></span>
            <input
              type="search"
              className="form-control au-input"
              aria-label="Buscar anime"
              placeholder="Buscar anime na comunidade ao vivo..."
              value={query}
              onChange={(e) => {
                searchController.current?.abort()
                setLoading(false)
                setLive(null)
                setLiveError(false)
                setQuery(e.target.value)
              }}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select className="form-select au-input" value={genre} onChange={(e) => setName(e.target.value)} aria-label="Filtrar por gênero">
            <option value="">Todos os gêneros</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select au-input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar animes">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-1">
          <button className="btn au-btn-primary w-100" type="submit" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Ir'}
          </button>
        </div>
      </form>

      <div className="d-flex flex-wrap gap-1 mb-4">
        <button
          type="button"
          className={`au-chip ${genre === '' ? 'au-chip-active' : ''}`}
          onClick={() => setName('')}
        >
          Tudo
        </button>
        {GENRES.slice(0, 14).map((g) => (
          <button
            key={g}
            type="button"
            className={`au-chip ${genre === g ? 'au-chip-active' : ''}`}
            onClick={() => setName(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {liveError && (
        <div className="alert alert-warning py-2 small d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span><i className="bi bi-exclamation-triangle me-1" />
            A busca ao vivo está indisponível agora. Exibindo resultados do catálogo local.
          </span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => {
              clearCache()
              submit({ preventDefault: () => {} })
            }}
          >
            <i className="bi bi-arrow-clockwise me-1" /> Tentar novamente
          </button>
        </div>
      )}

      <p className="small text-muted mb-3">
        {isLive
          ? `${visible.length} resultados ao vivo da comunidade.`
          : query.trim()
            ? `${visible.length} resultados do catálogo local.`
            : `${visible.length} títulos${genre ? ` em ${genre}` : ''} — catálogo local sincronizado.`}
      </p>

      {showEmptyState && visible.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-emoji-frown display-4 d-block mb-2" />
          Nenhum anime encontrado para essa busca.
        </div>
      )}

      <div className="row g-3">
        {visible.map((a) => (
          <div className="col-6 col-md-3 col-lg-2" key={a.id}>
            <AnimeCard anime={a} />
          </div>
        ))}
      </div>
    </div>
  )
}
