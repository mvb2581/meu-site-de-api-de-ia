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
  const [profileError, setProfileError] = useState('')
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
    setProfileError('')
    const success = updateProfile({ name: name.trim() || 'Viajante', bio })
    setSaved(success)
    if (!success) setProfileError('Não foi possível salvar as alterações neste navegador.')
    if (success) setTimeout(() => setSaved(false), 2000)
  }

  const submitPw = async (e) => {
    e.preventDefault()
    if (pw.next.length < 6) {
      setPwMsg({ ok: false, text: 'A nova senha precisa de pelo menos 6 caracteres.' })
      return
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: 'As senhas não conferem.' })
      return
    }
    const res = await changePassword(pw.current, pw.next)
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
          <div className="alert alert-info py-2 small" role="note">
            Este perfil e a sessão são armazenados apenas neste navegador; a aplicação ainda não tem autenticação de servidor.
          </div>
          {tab === 'info' && (
            <div>
              <form onSubmit={saveInfo}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold" htmlFor="profile-name">Nome de exibição</label>
                    <input
                      id="profile-name"
                      className="form-control au-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold" htmlFor="profile-email">E-mail (login)</label>
                    <input id="profile-email" className="form-control au-input" value={user.email} disabled />
                    <small className="text-muted">O e-mail identifica sua conta.</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold" htmlFor="profile-bio">Bio / descrição</label>
                    <textarea
                      id="profile-bio"
                      className="form-control au-input"
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte quem é seu personagem..."
                    />
                  </div>
                  <div className="col-12">
                    {profileError && <p className="small text-danger mb-2" role="alert">{profileError}</p>}
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
                  <label className="form-label small fw-semibold" htmlFor="password-current">Senha atual</label>
                  <input
                    id="password-current"
                    type="password"
                    autoComplete="current-password"
                    className="form-control au-input"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold" htmlFor="password-next">Nova senha</label>
                  <input
                    id="password-next"
                    type="password"
                    autoComplete="new-password"
                    className="form-control au-input"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold" htmlFor="password-confirm">Confirmar nova senha</label>
                  <input
                    id="password-confirm"
                    type="password"
                    autoComplete="new-password"
                    className="form-control au-input"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  {pwMsg && (
                    <div className={`alert ${pwMsg.ok ? 'alert-success' : 'alert-danger'} py-2 small`} role={pwMsg.ok ? 'status' : 'alert'}>
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
