import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark au-navbar sticky-top">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="au-brand-gem">✦</span>
          <span className="fw-bold">AUREX</span>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#auNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="auNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Início</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/animes">Animes</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/personagens">Personagens</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/generos">Gêneros</NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <NavLink className="btn au-btn-ghost d-flex align-items-center gap-2" to="/perfil">
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="au-nav-avatar"
                    width="30"
                    height="30"
                  />
                  <span className="d-none d-md-inline">{user.name}</span>
                </NavLink>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" />
                </button>
              </>
            ) : (
              <>
                <NavLink className="btn au-btn-ghost btn-sm" to="/login">Entrar</NavLink>
                <NavLink className="btn au-btn-primary btn-sm" to="/registro">Cadastrar</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}