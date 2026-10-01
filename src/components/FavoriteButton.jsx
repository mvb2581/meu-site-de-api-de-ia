import { useEffect, useState } from 'react'
import { isInMyList, subscribeMyList, toggleMyList } from '../storage/myList.js'

export default function FavoriteButton({ anime, compact = false }) {
  const [saved, setSaved] = useState(() => isInMyList(anime.id))
  const [error, setError] = useState(false)

  useEffect(() => {
    setSaved(isInMyList(anime.id))
    return subscribeMyList(() => setSaved(isInMyList(anime.id)))
  }, [anime.id])

  const handleClick = () => {
    const result = toggleMyList(anime)
    setError(!result.ok)
    if (result.ok) setSaved(result.saved)
  }

  return (
    <button
      type="button"
      className={`au-favorite-button ${compact ? 'is-compact' : ''} ${saved ? 'is-saved' : ''}`}
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remover ${anime.title} da minha lista` : `Adicionar ${anime.title} à minha lista`}
      title={error ? 'Não foi possível salvar neste navegador' : saved ? 'Remover da minha lista' : 'Adicionar à minha lista'}
    >
      <i className={`bi ${saved ? 'bi-bookmark-heart-fill' : 'bi-bookmark-heart'}`} aria-hidden="true" />
      {!compact && <span>{saved ? 'Na minha lista' : 'Minha lista'}</span>}
    </button>
  )
}
