export default function Footer() {
  return (
    <footer className="au-footer mt-auto">
      <div className="container py-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <h6 className="mb-1 fw-bold">✦ AUREX</h6>
            <p className="small mb-0 text-secondary">
              Enciclopédia interativa de animes.
              Projeto de fã, sem vínculo oficial com as licenças.
            </p>
          </div>
          <div className="col-md-4 small text-secondary">
            <p className="mb-1"><i className="bi bi-tags me-1" /> Catálogo, personagens e gêneros de anime</p>
            <p className="mb-0"><i className="bi bi-people me-1" /> Perfis estilo Crunchyroll/Netflix</p>
          </div>
          <div className="col-md-3 text-md-end">
            <p className="small mb-0 text-muted">Dados e imagens via <a href="https://anilist.co/" target="_blank" rel="noreferrer" className="au-link">AniList</a>, com catálogo local sincronizado</p>
          </div>
        </div>
      </div>
    </footer>
  )
}