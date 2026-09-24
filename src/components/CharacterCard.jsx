import { Link } from 'react-router-dom'
import JImage from './JImage.jsx'

export default function CharacterCard({ character }) {
  const favorites = character?.favourites ?? null
  return (
    <div className="au-char2-card">
      <Link to={`/personagens/${character.id}`} className="text-decoration-none">
        <div className="au-char2-photo">
          <JImage
            src={character.image}
            alt={character.name}
            className="img-fluid w-100"
            fallbackLabel="Sem imagem"
          />
          {favorites ? (
            <span className="au-anime-score">
              <i className="bi bi-heart-fill" /> {favorites.toLocaleString('pt-BR')}
            </span>
          ) : null}
        </div>
        <div className="au-char2-info">
          <h3 className="au-char2-name">{character.name}</h3>
        </div>
      </Link>
    </div>
  )
}