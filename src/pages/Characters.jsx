import { useEffect, useRef, useState } from 'react'
import { searchCharacters, clearCache } from '../api/anilist.js'
import { CATALOG_CHARACTERS } from '../data/catalog.js'
import CharacterCard from '../components/CharacterCard.jsx'

export default function Characters() {
  const searchController = useRef(null)
  const [query, setQuery] = useState('')
  const [live, setLive] = useState(null)
  const [liveError, setLiveError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => () => searchController.current?.abort(), [])

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
      const results = await searchCharacters(q, 36, { signal: controller.signal })
      if (!controller.signal.aborted) setLive(results)
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setLiveError(true)
        setLive(null)
      }
    } finally {
      if (searchController.current === controller) setLoading(false)
    }
  }

  const local = CATALOG_CHARACTERS.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  ).slice(0, 36)

  const offlineFallback = query.trim() && !live ? local : null
  const visible = query.trim() ? (live || local) : CATALOG_CHARACTERS.slice(0, 36)
  const isLive = !!live

  return (
    <div className="container py-5">
      <header className="mb-4">
        <h1 className="h2 fw-bold">Personagens</h1>
        <p className="text-muted">
          Os personagens que marcaram gerações de fãs. Busque pelo seu favorito ou explore os principais.
        </p>
      </header>

      <form onSubmit={submit} className="row g-2 mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text au-input-group"><i className="bi bi-search" /></span>
            <input
              type="search"
              className="form-control au-input"
              aria-label="Buscar personagem"
              placeholder="Buscar personagem na comunidade ao vivo..."
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
          <button className="btn au-btn-primary w-100" type="submit" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Buscar'}
          </button>
        </div>
        <div className="col-md-3">
          <button
            type="button"
            className="btn au-btn-ghost w-100"
            onClick={() => {
              searchController.current?.abort()
              setLoading(false)
              setQuery('')
              setLive(null)
              setLiveError(false)
            }}
            disabled={loading}
          >
            Todos os personagens
          </button>
        </div>
      </form>

      {liveError && (
        <div className="alert alert-warning py-2 small d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span><i className="bi bi-exclamation-triangle me-1" />
            A busca ao vivo está indisponível agora. Mostrando combinações do catálogo local.
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
            : `${visible.length} personagens principais do catálogo.`}
      </p>

      {visible.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-emoji-frown display-4 d-block mb-2" />
          Nenhum personagem encontrado.
        </div>
      )}

      <div className="row g-3">
        {visible.map((c) => (
          <div className="col-6 col-md-3 col-lg-2" key={c.id}>
            <CharacterCard character={c} />
          </div>
        ))}
      </div>
    </div>
  )
}
