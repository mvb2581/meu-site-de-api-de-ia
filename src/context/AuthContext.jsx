import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_AVATAR, DEFAULT_BANNER } from '../data/media.js'

const STORAGE_KEY = 'aurex_users'
const SESSION_KEY = 'aurex_session'

const AuthContext = createContext(null)

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY))
    } catch {
      return null
    }
  })

  const currentUser = useMemo(
    () => (session ? users.find((u) => u.id === session.userId) || null : null),
    [users, session]
  )

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  }, [session])

  function register({ name, email, password }) {
    const emailNorm = email.trim().toLowerCase()
    if (users.some((u) => u.email === emailNorm)) {
      return { ok: false, error: 'Já existe uma conta com esse e-mail.' }
    }
    const user = {
      id: `u_${Date.now()}`,
      name: name.trim() || 'Viajante',
      email: emailNorm,
      password,
      bio: '',
      avatar: DEFAULT_AVATAR,
      banner: DEFAULT_BANNER,
      createdAt: new Date().toISOString()
    }
    saveUsers([...users, user])
    setUsers((prev) => [...prev, user])
    setSession({ userId: user.id })
    return { ok: true, user }
  }

  function login({ email, password }) {
    const emailNorm = email.trim().toLowerCase()
    const user = users.find((u) => u.email === emailNorm && u.password === password)
    if (!user) return { ok: false, error: 'E-mail ou senha incorretos.' }
    setSession({ userId: user.id })
    return { ok: true, user }
  }

  function loginDemo() {
    const demo = {
      id: 'u_demo',
      name: 'Viajante Demon',
      email: 'demo@aurex.dev',
      password: 'demon123',
      bio: 'Maratonando animes e colecionando perfis.',
      avatar: DEFAULT_AVATAR,
      banner: DEFAULT_BANNER,
      createdAt: new Date().toISOString()
    }
    if (!users.some((u) => u.id === demo.id)) {
      saveUsers([...users, demo])
      setUsers((prev) => [...prev, demo])
    }
    setSession({ userId: demo.id })
    return { ok: true }
  }

  function logout() {
    setSession(null)
  }

  function updateProfile(patch) {
    if (!session) return
    const updated = users.map((u) => (u.id === session.userId ? { ...u, ...patch } : u))
    saveUsers(updated)
    setUsers(updated)
  }

  function changePassword(current, next) {
    const user = users.find((u) => u.id === session.userId)
    if (!user) return { ok: false, error: 'Sessão inválida.' }
    if (user.password !== current) return { ok: false, error: 'Senha atual incorreta.' }
    updateProfile({ password: next })
    return { ok: true }
  }

  const value = {
    users,
    user: currentUser,
    isAuthenticated: !!currentUser,
    register,
    login,
    loginDemo,
    logout,
    updateProfile,
    changePassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}