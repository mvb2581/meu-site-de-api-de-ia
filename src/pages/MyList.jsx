import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnimeCard from '../components/AnimeCard.jsx'
import { readMyList, subscribeMyList } from '../storage/myList.js'

export default function MyList() {
  const [items, setItems] = useState(readMyList)

  useEffect(() => subscribeMyList(() => setItems(readMyList())), [])

  return (
    <section className="container py-5">
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <p className="au-hero-kicker small mb-1">SUA COLEÇÃO</p>
          <h1 className="h2 fw-bold mb-0">Minha lista</h1>
          <p className="text-muted mb-0">Animes guardados neste navegador.</p>
        </div>
        <Link to="/animes" className="btn au-btn-ghost btn-sm">Explorar catálogo</Link>
      </div>

      {!items.length ? (
        <div className="au-empty-state text-center py-5">
          <i className="bi bi-bookmark-heart display-4 d-block mb-3" aria-hidden="true" />
          <h2 className="h5 fw-bold">Sua lista está vazia</h2>
          <p className="text-muted mb-3">Salve um anime pelo botão de favoritos para encontrá-lo aqui.</p>
          <Link to="/animes" className="btn au-btn-primary">Explorar animes</Link>
        </div>
      ) : (
        <div className="row g-3">
          {items.map((anime) => (
            <div className="col-6 col-md-3 col-lg-2" key={anime.id}><AnimeCard anime={anime} /></div>
          ))}
        </div>
      )}
    </section>
  )
}
