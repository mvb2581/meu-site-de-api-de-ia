import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark au-navbar sticky-top">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={closeMenu}>
          <span className="au-brand-gem">✦</span>
          <span className="fw-bold">AUREX</span>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="auNav"
          aria-label={menuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="auNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink className="nav-link" to="/" onClick={closeMenu}>Início</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/animes" onClick={closeMenu}>Animes</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/minha-lista" onClick={closeMenu}>Minha lista</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/historico" onClick={closeMenu}>Histórico</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/personagens" onClick={closeMenu}>Personagens</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/generos" onClick={closeMenu}>Gêneros</NavLink></li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <NavLink className="btn au-btn-ghost d-flex align-items-center gap-2" to="/perfil" onClick={closeMenu}>
                  <img src={user.avatar} alt="" className="au-nav-avatar" width="30" height="30" />
                  <span className="d-none d-md-inline">{user.name}</span>
                </NavLink>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout} aria-label="Sair da conta" title="Sair">
                  <i className="bi bi-box-arrow-right" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <NavLink className="btn au-btn-ghost btn-sm" to="/login" onClick={closeMenu}>Entrar</NavLink>
                <NavLink className="btn au-btn-primary btn-sm" to="/registro" onClick={closeMenu}>Cadastrar</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
