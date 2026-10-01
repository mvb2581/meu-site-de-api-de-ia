import { useNavigate } from 'react-router-dom'
import { GENRES, CATALOG_ANIME } from '../data/catalog.js'

export default function Genres() {
  const navigate = useNavigate()

  return (
    <div className="container py-5">
      <header className="mb-4">
        <h1 className="h2 fw-bold">Gêneros</h1>
        <p className="text-muted">
          Explore o catálogo por categoria. Clique em um gênero para ver os títulos dele.
        </p>
      </header>

      <div className="d-flex flex-wrap gap-2">
        {GENRES.map((g) => {
          const count = CATALOG_ANIME.filter((a) => a.genres.includes(g)).length
          return (
            <button
              key={g}
              type="button"
              className="au-genre-chip"
              onClick={() => navigate(`/animes?genero=${encodeURIComponent(g)}`)}
            >
              <span>{g}</span>
              <small>{count}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}
