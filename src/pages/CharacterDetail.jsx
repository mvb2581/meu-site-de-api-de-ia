import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCharacterFull, clearCache } from '../api/anilist.js'
import { CATALOG_CHARACTERS, CATALOG_ANIME } from '../data/catalog.js'
import JImage from '../components/JImage.jsx'

export default function CharacterDetail() {
  const { id } = useParams()
  const catalogChar = CATALOG_CHARACTERS.find((c) => String(c.id) === id)
  const [live, setLive] = useState(null)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setError('')
    setLive(null)
    getCharacterFull(id)
      .then((c) => alive && setLive(c))
      .catch((e) => alive && setError(typeof e === 'string' ? e : e.message))
    return () => {
      alive = false
    }
  }, [id, tick])

  const details = live || catalogChar || null

  if (!details) {
    if (error) {
      return (
        <div className="container py-5">
          <div className="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span><i className="bi bi-exclamation-triangle me-1" /> {error}</span>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => {
                clearCache()
                setTick((t) => t + 1)
              }}
            >
              <i className="bi bi-arrow-clockwise me-1" /> Tentar novamente
            </button>
          </div>
          <Link to="/personagens" className="btn au-btn-primary">Voltar aos personagens</Link>
        </div>
      )
    }
    return (
      <div className="container py-5">
        <div className="au-skeleton-row">
          <div className="au-skeleton au-skeleton-hero" />
          <div className="au-skeleton au-skeleton-wide" />
        </div>
      </div>
    )
  }

  const offline = !live && !!catalogChar

  const animeography = live?.animeography?.length
    ? live.animeography
    : catalogChar
      ? CATALOG_ANIME.filter((a) => (a.characters || []).some((c) => c.id === catalogChar.id)).map((a) => ({
          id: a.id,
          title: a.title,
          image: a.image,
          role: ''
        }))
      : []

  const voices = live?.voices || []

  return (
    <div className="container py-5">
      <Link to="/personagens" className="btn au-btn-ghost btn-sm mb-3">
        <i className="bi bi-arrow-left me-1" /> Personagens
      </Link>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="au-char2-profile card">
            <JImage
              src={details.image}
              alt={details.name}
              className="img-fluid w-100"
              fallbackLabel="Sem imagem"
            />
            <div className="card-body">
              <h1 className="h4 fw-bold text-center mb-1">{details.name}</h1>
              {details.native && (
                <p className="text-muted small text-center mb-3">{details.native}</p>
              )}
              {details.favourites ? (
                <p className="small text-center mb-0">
                  <i className="bi bi-heart-fill au-link me-1" />
                  <strong>{details.favourites.toLocaleString('pt-BR')}</strong> favoritos
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {offline && (
            <div className="alert alert-info py-2 small">
              <i className="bi bi-info-circle me-1" />
              Exibindo dados locais sincronizados com a comunidade.
            </div>
          )}

          <section className="card au-panel mb-4">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-2"><i className="bi bi-person-vcard me-1" /> Sobre</h2>
              {live?.about ? (
                <div
                  className="text-secondary small lh-lg"
                  dangerouslySetInnerHTML={{ __html: live.about }}
                />
              ) : (
                <p className="text-secondary small lh-lg mb-0">
                  {catalogChar
                    ? 'Personagem presente no catálogo local. Conecte-se para ver a biografia completa.'
                    : 'Sem informações disponíveis.'}
                </p>
              )}
            </div>
          </section>

          {voices.length > 0 && (
            <section className="card au-panel mb-4">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-3"><i className="bi bi-mic me-1" /> Dubladores (Japonês)</h2>
                <div className="row g-3">
                  {voices.map((v) => (
                    <div className="col-6 col-md-4 col-lg-3" key={v.id}>
                      <div className="au-role-card">
                        <img
                          src={v.image}
                          alt={v.name}
                          className="img-fluid w-100 rounded-circle au-role-avatar"
                          loading="lazy"
                        />
                        <h6 className="au-role-name">{v.name}</h6>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {animeography.length > 0 && (
            <section className="card au-panel mb-4">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-3"><i className="bi bi-tv me-1" /> Animes em que apareceu</h2>
                <div className="row g-3">
                  {animeography.map((r) => (
                    <div className="col-6 col-md-4 col-lg-3" key={r.id}>
                      <Link to={`/animes/${r.id}`} className="text-decoration-none">
                        <div className="au-role-card au-role-wide">
                          <JImage
                            src={r.image}
                            alt={r.title}
                            className="img-fluid w-100 rounded-2"
                            fallbackLabel="Sem imagem"
                          />
                          <h6 className="au-role-name">{r.title}</h6>
                          {r.role && <small className="au-tag">{r.role}</small>}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}