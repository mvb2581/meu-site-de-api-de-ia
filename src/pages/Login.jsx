import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const res = login(form)
    if (res.ok) navigate('/perfil')
    else setError(res.error)
  }

  const demo = () => {
    loginDemo()
    navigate('/perfil')
  }

  return (
    <div className="au-auth-wrap">
      <div className="au-auth-card card">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="au-brand-gem display-6">✦</span>
            <h1 className="h3 fw-bold mt-2">Bem-vindo de volta</h1>
            <p className="text-muted small mb-0">Entre para editar seu perfil de aventureiro.</p>
          </div>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">E-mail</label>
              <input
                type="email"
                className="form-control au-input"
                placeholder="voce@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Senha</label>
              <input
                type="password"
                className="form-control au-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <button className="btn au-btn-primary w-100 mb-2">Entrar</button>
            <button type="button" className="btn au-btn-ghost w-100" onClick={demo}>
              <i className="bi bi-stars me-1" /> Entrar com conta de demonstração
            </button>
          </form>

          <p className="text-center small text-muted mt-3 mb-0">
            Não tem conta? <Link to="/registro" className="au-link">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}