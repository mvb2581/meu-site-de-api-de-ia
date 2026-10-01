import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_AVATAR, DEFAULT_BANNER } from '../data/media.js'

const STORAGE_KEY = 'aurex_users'
const SESSION_KEY = 'aurex_session'
const PBKDF2_ITERATIONS = 310_000
const PROFILE_FIELDS = ['name', 'bio', 'avatar', 'banner']

const AuthContext = createContext(null)

function loadUsers() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    return true
  } catch {
    return false
  }
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('Este navegador não oferece armazenamento seguro de senha.')
  const passwordSalt = salt || globalThis.crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: passwordSalt,
    iterations: PBKDF2_ITERATIONS,
    hash: 'SHA-256'
  }, key, 256)
  return { passwordSalt: toBase64(passwordSalt), passwordHash: toBase64(new Uint8Array(hash)) }
}

async function verifyPassword(password, user) {
  if (!user.passwordHash || !user.passwordSalt) return user.password === password
  const derived = await hashPassword(password, fromBase64(user.passwordSalt))
  const actual = fromBase64(derived.passwordHash)
  const expected = fromBase64(user.passwordHash)
  if (actual.length !== expected.length) return false
  let difference = 0
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index]
  return difference === 0
}

function publicUser(user) {
  if (!user) return null
  const { password: _password, passwordHash: _hash, passwordSalt: _salt, ...profile } = user
  return profile
}

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [session, setSession] = useState(readSession)

  const currentUser = useMemo(() => {
    const user = session ? users.find((item) => item.id === session.userId) : null
    return publicUser(user)
  }, [users, session])

  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      // A sessão continua ativa até o app fechar, mesmo quando o storage está indisponível.
    }
  }, [session])

  useEffect(() => {
    let cancelled = false
    const migrateLegacyUsers = async () => {
      const currentUsers = loadUsers()
      if (!currentUsers.some((user) => user.password && !user.passwordHash)) return
      const migratedById = new Map(await Promise.all(currentUsers.map(async (user) => {
        if (!user.password || user.passwordHash) return user
        const credentials = await hashPassword(user.password)
        const { password, ...rest } = user
        return { ...rest, ...credentials }
      })).then((migrated) => migrated.filter((user) => user?.id).map((user) => [user.id, user])))
      if (cancelled) return
      const latestUsers = loadUsers()
      const migrated = latestUsers.map((user) => migratedById.get(user.id) || user)
      if (saveUsers(migrated)) setUsers(migrated)
    }
    migrateLegacyUsers().catch(() => {
      // The next successful login upgrades that account without blocking startup.
    })
    return () => { cancelled = true }
  }, [])

  async function register({ name, email, password }) {
    const emailNorm = email.trim().toLowerCase()
    if (users.some((user) => user.email === emailNorm)) return { ok: false, error: 'Já existe uma conta com esse e-mail.' }
    try {
      const credentials = await hashPassword(password)
      const user = {
        id: `u_${crypto.randomUUID()}`,
        name: name.trim() || 'Viajante',
        email: emailNorm,
        ...credentials,
        bio: '',
        avatar: DEFAULT_AVATAR,
        banner: DEFAULT_BANNER,
        createdAt: new Date().toISOString()
      }
      const nextUsers = [...users, user]
      if (!saveUsers(nextUsers)) return { ok: false, error: 'Não foi possível salvar neste navegador. Libere espaço e tente novamente.' }
      setUsers(nextUsers)
      setSession({ userId: user.id })
      return { ok: true, user: publicUser(user) }
    } catch (error) {
      return { ok: false, error: error.message || 'Não foi possível proteger a senha neste navegador.' }
    }
  }

  async function login({ email, password }) {
    const emailNorm = email.trim().toLowerCase()
    const user = users.find((item) => item.email === emailNorm)
    if (!user) return { ok: false, error: 'E-mail ou senha incorretos.' }
    try {
      if (!(await verifyPassword(password, user))) return { ok: false, error: 'E-mail ou senha incorretos.' }
      let signedInUser = user
      if (!user.passwordHash) {
        const credentials = await hashPassword(password)
        const { password: _legacyPassword, ...rest } = user
        signedInUser = { ...rest, ...credentials }
        const nextUsers = users.map((item) => item.id === user.id ? signedInUser : item)
        if (saveUsers(nextUsers)) setUsers(nextUsers)
      }
      setSession({ userId: user.id })
      return { ok: true, user: publicUser(signedInUser) }
    } catch (error) {
      return { ok: false, error: error.message || 'Não foi possível validar a senha neste navegador.' }
    }
  }

  async function loginDemo() {
    const demo = {
      id: 'u_demo',
      name: 'Viajante Demon',
      email: 'demo@aurex.dev',
      bio: 'Maratonando animes e colecionando perfis.',
      avatar: DEFAULT_AVATAR,
      banner: DEFAULT_BANNER,
      createdAt: new Date().toISOString()
    }
    try {
      const existing = users.find((user) => user.id === demo.id)
      const { password: _legacyPassword, ...existingProfile } = existing || {}
      const demoUser = existing?.passwordHash
        ? existing
        : { ...demo, ...existingProfile, ...await hashPassword('demon123') }
      const nextUsers = existing ? users.map((user) => user.id === demo.id ? demoUser : user) : [...users, demoUser]
      if (!saveUsers(nextUsers)) return { ok: false, error: 'Não foi possível salvar neste navegador.' }
      setUsers(nextUsers)
      setSession({ userId: demo.id })
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message || 'Não foi possível abrir a conta de demonstração.' }
    }
  }

  function logout() {
    setSession(null)
  }

  function updateProfile(patch) {
    if (!session) return false
    const safePatch = Object.fromEntries(PROFILE_FIELDS.filter((field) => field in patch).map((field) => [field, patch[field]]))
    const updated = users.map((user) => user.id === session.userId ? { ...user, ...safePatch } : user)
    if (!saveUsers(updated)) return false
    setUsers(updated)
    return true
  }

  async function changePassword(current, next) {
    const user = users.find((item) => item.id === session?.userId)
    if (!user) return { ok: false, error: 'Sessão inválida.' }
    try {
      if (!(await verifyPassword(current, user))) return { ok: false, error: 'Senha atual incorreta.' }
      const credentials = await hashPassword(next)
      const { password: _legacyPassword, ...rest } = user
      const nextUsers = users.map((item) => item.id === user.id ? { ...rest, ...credentials } : item)
      if (!saveUsers(nextUsers)) return { ok: false, error: 'Não foi possível salvar a senha neste navegador.' }
      setUsers(nextUsers)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message || 'Não foi possível alterar a senha.' }
    }
  }

  const value = {
    users: users.map(publicUser),
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
