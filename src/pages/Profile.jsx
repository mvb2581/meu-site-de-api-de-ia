import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AvatarPicker from '../components/AvatarPicker.jsx'
import BannerPicker from '../components/BannerPicker.jsx'

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('info')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [saved, setSaved] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState(null)

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setBio(user.bio || '')
  }, [user])

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  if (!user) return null

  const saveInfo = (e) => {
    e.preventDefault()
    updateProfile({ name: name.trim() || 'Viajante', bio })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const submitPw = (e) => {
    e.preventDefault()
    if (pw.next.length < 6) {
      setPwMsg({ ok: false, text: 'A nova senha precisa de pelo menos 6 caracteres.' })
      return
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: 'As senhas não conferem.' })
      return
    }
    const res = changePassword(pw.current, pw.next)
    setPwMsg(res.ok ? { ok: true, text: 'Senha alterada com sucesso.' } : { ok: false, text: res.error })
    if (res.ok) setPw({ current: '', next: '', confirm: '' })
  }

  const tabs = [
    { id: 'info', label: 'Informações', icon: 'person-vcard' },
    { id: 'avatar', label: 'Foto de perfil', icon: 'person-badge' },
    { id: 'banner', label: 'Banner', icon: 'image' }
  ]

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="h2 fw-bold mb-0">Meu Perfil</h1>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          <i className="bi bi-box-arrow-right me-1" /> Sair
        </button>
      </div>

      <section className="au-profile-preview mb-4">
        <div
          className="au-preview-banner"
          style={{ backgroundImage: `url(${user.banner})` }}
        >
          <div className="au-preview-gradient" />
          <div className="au-preview-content">
            <img src={user.avatar} alt="Avatar do perfil" className="au-preview-avatar" />
            <div>
              <p className="au-preview-kicker mb-1">✦ Perfil de anime</p>
              <h2 className="h3 fw-bold mb-1">{name || user.name}</h2>
              <p className="small text-white-50 mb-0">{bio || user.email}</p>
            </div>
          </div>
        </div>
        <p className="au-preview-strip"></p>
      </section>

      <div className="card au-panel">
        <div className="card-header au-panel-header">
          <ul className="nav nav-tabs au-tabs border-0">
            {tabs.map((t) => (
              <li className="nav-item" key={t.id}>
                <button
                  className={`nav-link ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <i className={`bi bi-${t.icon} me-1`} /> {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body">
          {tab === 'info' && (
            <div>
              <form onSubmit={saveInfo}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Nome de exibição</label>
                    <input
                      className="form-control au-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">E-mail (login)</label>
                    <input className="form-control au-input" value={user.email} disabled />
                    <small className="text-muted">O e-mail identifica sua conta.</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Bio / descrição</label>
                    <textarea
                      className="form-control au-input"
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte quem é seu personagem..."
                    />
                  </div>
                  <div className="col-12">
                    <button className="btn au-btn-primary">
                      {saved ? <><i className="bi bi-check2-circle me-1" /> Salvo!</> : 'Salvar alterações'}
                    </button>
                  </div>
                </div>
              </form>

              <hr className="my-4 au-divider" />

              <h5 className="fw-bold mb-3">Alterar senha</h5>
              <form onSubmit={submitPw} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Senha atual</label>
                  <input
                    type="password"
                    className="form-control au-input"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Nova senha</label>
                  <input
                    type="password"
                    className="form-control au-input"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Confirmar nova senha</label>
                  <input
                    type="password"
                    className="form-control au-input"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  {pwMsg && (
                    <div className={`alert ${pwMsg.ok ? 'alert-success' : 'alert-danger'} py-2 small`}>
                      {pwMsg.text}
                    </div>
                  )}
                  <button className="btn au-btn-ghost">Atualizar senha</button>
                </div>
              </form>
            </div>
          )}

          {tab === 'avatar' && (
            <AvatarPicker
              value={user.avatar}
              onChange={(src) => updateProfile({ avatar: src })}
            />
          )}

          {tab === 'banner' && (
            <BannerPicker
              value={user.banner}
              onChange={(src) => updateProfile({ banner: src })}
            />
          )}
        </div>
      </div>
    </div>
  )
}