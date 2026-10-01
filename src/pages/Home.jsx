import { Link } from 'react-router-dom'
import { CATALOG_ANIME, CATALOG_CHARACTERS, GENRES } from '../data/catalog.js'
import AnimeCard from '../components/AnimeCard.jsx'
import CharacterCard from '../components/CharacterCard.jsx'
import JImage from '../components/JImage.jsx'
import ContinueWatching from '../components/ContinueWatching.jsx'

function Section({ title, subtitle, link, items, render }) {
  if (!items.length) return null
  return (
    <section className="container py-4">
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <h2 className="h3 fw-bold mb-0">{title}</h2>
          {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
        </div>
        {link && (
          <Link to={link.to} className="btn au-btn-ghost btn-sm text-nowrap">
            {link.label} <i className="bi bi-chevron-right" />
          </Link>
        )}
      </div>
      <div className="row g-3">
        {items.map((item) => (
          <div className="col-6 col-md-4 col-lg-2" key={item.id}>{render(item)}</div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const tv = CATALOG_ANIME.filter((a) => a.format === 'TV')
  const masterpieces = [...tv].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 12)
  const movies = CATALOG_ANIME.filter((a) => a.format === 'MOVIE').slice(0, 8)
  const recent = [...CATALOG_ANIME]
    .filter((a) => a.year >= 2019 && a.format === 'TV')
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 12)
  const featured = [...tv].sort((a, b) => (b.score || 0) - (a.score || 0)).find((a) => a.banner) || tv[0]

  return (
    <>
      <section className="au-hero">
        <div className="container py-5 text-center text-white">
          <p className="au-hero-kicker mb-2">✦ Enciclopédia de animes feita por fãs</p>
          <h1 className="display-4 fw-bold mb-3">
            Para todos os <span className="au-gradient-text">gostos</span>
          </h1>
          <p className="lead text-white-50 mx-auto mb-4" style={{ maxWidth: 720 }}>
            Clássicos, novidades, ação, romance, terror, esporte e muito mais.
            Monte seu perfil no estilo das grandes plataformas de streaming.
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to="/animes" className="btn au-btn-primary btn-lg">
              Explorar catálogo <i className="bi bi-arrow-right ms-1" />
            </Link>
            <Link to="/registro" className="btn btn-outline-light btn-lg">
              Criar meu perfil
            </Link>
          </div>
        </div>
      </section>

      <ContinueWatching />

      {featured && (
        <section className="seminal">
          <div className="row g-0 align-items-center">
            <div className="col-md-3 d-none d-md-block">
              <JImage src={featured.image} alt={featured.title} className="img-fluid w-100" fallbackLabel="Destaque" />
            </div>
            <div className="col-md-9 p-4 p-md-5">
              <p className="au-hero-kicker mb-1">✦ EM DESTAQUE</p>
              <h2 className="h2 fw-bold text-white">{featured.title}</h2>
              <p className="text-white-50 small mb-1">
                {featured.genres.slice(0, 4).join(' · ')}
              </p>
              {featured.synopsis && (
                <p className="text-white-50 small" style={{ maxWidth: 760 }}>
                  {featured.synopsis.length > 400 ? featured.synopsis.slice(0, 400) + '…' : featured.synopsis}
                </p>
              )}
              <Link to={`/animes/${featured.id}`} className="btn au-btn-primary mt-2">
                Ver detalhes <i className="bi bi-play-fill ms-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Section
        title="Obras-primas atemporais"
        subtitle="O melhor das notas da comunidade"
        link={{ to: '/animes', label: 'Todos os animes' }}
        items={masterpieces}
        render={(a) => <AnimeCard anime={a} />}
      />

      <Section
        title="Títulos recentes"
        subtitle="Novidades que todo mundo está comentando"
        link={{ to: '/animes', label: 'Ver catálogo' }}
        items={recent}
        render={(a) => <AnimeCard anime={a} />}
      />

      <section className="au-section-alt">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div>
              <h2 className="h3 fw-bold mb-0">Personagens favoritos</h2>
              <p className="text-muted small mb-0">Os nomes que conquistaram os fãs.</p>
            </div>
            <Link to="/personagens" className="btn au-btn-ghost btn-sm text-nowrap">
              Ver todos <i className="bi bi-chevron-right" />
            </Link>
          </div>
          <div className="row g-3">
            {CATALOG_CHARACTERS.slice(0, 12).map((c) => (
              <div className="col-6 col-md-4 col-lg-2" key={c.id}>
                <CharacterCard character={c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {movies.length > 0 && (
        <Section
          title="Filmes de animação"
          subtitle="Obras cinematográficas para maratonar num fim de semana"
          link={{ to: '/animes', label: 'Ver catálogo' }}
          items={movies}
          render={(a) => <AnimeCard anime={a} />}
        />
      )}

      <section className="au-section-alt">
        <div className="container py-4">
          <h2 className="h3 fw-bold mb-1">Explore por gênero</h2>
          <p className="text-muted small mb-3">Cada fã tem seu estilo — encontre o seu.</p>
          <div className="d-flex flex-wrap gap-2">
            {GENRES.map((g) => {
              const count = CATALOG_ANIME.filter((a) => a.genres.includes(g)).length
              return (
                <Link
                  key={g}
                  to={`/animes?genero=${encodeURIComponent(g)}`}
                  className="au-genre-chip text-decoration-none"
                >
                  <span>{g}</span>
                  <small>{count}</small>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
