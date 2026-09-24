import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (form.password !== form.confirm) {
      setError('As senhas não conferem.')
      return
    }
    const res = register(form)
    if (res.ok) navigate('/perfil')
    else setError(res.error)
  }

  return (
    <div className="au-auth-wrap">
      <div className="au-auth-card card">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="au-brand-gem display-6">✦</span>
            <h1 className="h3 fw-bold mt-2">Criar conta</h1>
            <p className="text-muted small mb-0">
              Cadastre-se para montar seu perfil estilo <strong>Crunchyroll/Netflix</strong>.
            </p>
          </div>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nome de exibição</label>
              <input
                className="form-control au-input"
                placeholder="Ex.: Viajante de Ranoa"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
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
            <div className="row">
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Confirmar senha</label>
                <input
                  type="password"
                  className="form-control au-input"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <button className="btn au-btn-primary w-100">Criar minha conta</button>
          </form>

          <p className="text-center small text-muted mt-3 mb-0">
            Já tem conta? <Link to="/login" className="au-link">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}