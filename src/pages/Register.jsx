import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (form.password !== form.confirm) {
      setError('As senhas não conferem.')
      return
    }
    setLoading(true)
    try {
      const result = await register(form)
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
            <h1 className="h3 fw-bold mt-2">Criar conta</h1>
            <p className="text-muted small mb-0">Cadastre-se para montar seu perfil estilo streaming.</p>
          </div>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold" htmlFor="register-name">Nome de exibição</label>
              <input id="register-name" autoComplete="name" className="form-control au-input" placeholder="Ex.: Viajante de Ranoa" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold" htmlFor="register-email">E-mail</label>
              <input id="register-email" type="email" autoComplete="email" className="form-control au-input" placeholder="voce@exemplo.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold" htmlFor="register-password">Senha</label>
                <input id="register-password" type="password" autoComplete="new-password" className="form-control au-input" placeholder="Pelo menos 6 caracteres" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold" htmlFor="register-confirm">Confirmar senha</label>
                <input id="register-confirm" type="password" autoComplete="new-password" className="form-control au-input" placeholder="Repita a senha" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required />
              </div>
            </div>

            {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
            <button className="btn au-btn-primary w-100" disabled={loading}>
              {loading ? 'Criando conta…' : 'Criar minha conta'}
            </button>
          </form>

          <p className="small text-muted mt-3 mb-0" role="note">
            Esta conta fica somente neste navegador. Ela não oferece autenticação segura de servidor nem sincronização.
          </p>
          <p className="text-center small text-muted mt-3 mb-0">
            Já tem conta? <Link to="/login" className="au-link">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
