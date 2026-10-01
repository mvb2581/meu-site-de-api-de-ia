import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="container py-5 text-center">
      <p className="au-link fw-bold mb-2">Erro 404</p>
      <h1 className="h2 fw-bold">Página não encontrada</h1>
      <p className="text-muted mb-4">O endereço pode ter mudado ou não existe.</p>
      <Link to="/" className="btn au-btn-primary">Voltar ao início</Link>
    </section>
  )
}
