import { Link } from 'react-router-dom'
import JImage from './JImage.jsx'

export default function AnimeCard({ anime }) {
  const score = anime?.score ?? null
  return (
    <div className="au-anime-card">
      <Link to={`/animes/${anime.id}`} className="text-decoration-none">
        <div className="au-anime-cover">
          <JImage
            src={anime.image}
            alt={anime.title}
            className="img-fluid w-100"
            fallbackLabel="Sem imagem"
          />
          {score && (
            <span className="au-anime-score">
              <i className="bi bi-star-fill" /> {score}
            </span>
          )}
        </div>
        <div className="au-anime-info">
          <h3 className="au-anime-title">{anime.title}</h3>
          <p className="au-anime-meta">
            {anime.format && <span>{anime.format}</span>}
            {anime.episodes && <span>{anime.episodes} eps</span>}
            {anime.year && <span>{anime.year}</span>}
          </p>
        </div>
      </Link>
    </div>
  )
}