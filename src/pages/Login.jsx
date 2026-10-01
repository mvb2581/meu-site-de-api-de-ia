import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form)
      if (result.ok) navigate('/perfil')
      else setError(result.error)
    } finally {
      setLoading(false)
    }
  }

  const demo = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await loginDemo()
      if (result.ok) navigate('/perfil')
      else setError(result.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="au-auth-wrap">
      <div className="au-auth-card card">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="au-brand-gem display-6" aria-hidden="true">✦</span>
            <h1 className="h3 fw-bold mt-2">Bem-vindo de volta</h1>
            <p className="text-muted small mb-0">Entre para editar seu perfil de aventureiro.</p>
          </div>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" htmlFor="login-email">E-mail</label>
              <input id="login-email" type="email" autoComplete="email" className="form-control au-input" placeholder="voce@exemplo.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold" htmlFor="login-password">Senha</label>
              <input id="login-password" type="password" autoComplete="current-password" className="form-control au-input" placeholder="••••••••" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </div>

            {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
            <button className="btn au-btn-primary w-100 mb-2" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
            <button type="button" className="btn au-btn-ghost w-100" onClick={demo} disabled={loading}>
              <i className="bi bi-stars me-1" aria-hidden="true" /> Entrar com conta de demonstração
            </button>
          </form>

          <p className="small text-muted mt-3 mb-0" role="note">
            As contas ficam somente neste navegador e não são sincronizadas entre dispositivos.
          </p>
          <p className="text-center small text-muted mt-3 mb-0">
            Não tem conta? <Link to="/registro" className="au-link">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
