// Kullanıcı deposu — localStorage tabanlı DEMO auth
//
// UYARI: Bu yapı yalnızca demo içindir. localStorage kullanıcı tarafından değiştirilebildiği için
// (ör. role: 'admin' yazmak) burada hiçbir yetki kontrolü gerçek güvenlik sağlamaz.
// Canlı ortam için sunucu tarafı kimlik doğrulama (Cloudflare Workers + D1) gerekir.

import { storageGet, storageSet, STORAGE_KEYS, cleanupLegacy } from './storage.js'
import { hashPassword, verifyPassword, generateSalt, uuid } from './crypto.js'

// Demo hesapları yalnızca geliştirme modunda veya VITE_ENABLE_DEMO_ACCOUNTS=true iken oluşturulur.
// Üretim derlemesinde varsayılan olarak KAPALIDIR; böylece şifreler canlı pakete gömülmez.
export const DEMO_ACCOUNTS_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_ACCOUNTS === 'true'

const SEED_USERS = DEMO_ACCOUNTS_ENABLED
  ? [
      { name: 'Japonya Ekibi', email: 'admin@nipponexpress.tr', password: 'Admin123!', role: 'admin' },
      { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', password: 'Demo1234!', role: 'user' },
      { name: 'Zeynep Kaya', email: 'zeynep@example.com', password: 'Demo1234!', role: 'user' },
    ]
  : []

export const LIMITS = { name: 80, email: 254, passwordMin: 8, passwordMax: 128 }

async function buildSeedUsers() {
  const users = []
  for (const seed of SEED_USERS) {
    const salt = generateSalt()
    users.push({
      id: uuid(),
      name: seed.name,
      email: seed.email.toLowerCase(),
      passwordHash: await hashPassword(seed.password, salt),
      salt,
      role: seed.role,
      createdAt: new Date().toISOString(),
    })
  }
  return users
}

// İlk açılışta (yalnızca demo modunda) seed
export async function ensureSeedUsers() {
  cleanupLegacy()
  let users = storageGet(STORAGE_KEYS.USERS, null)
  if (!Array.isArray(users) || users.length === 0) {
    users = await buildSeedUsers()
    storageSet(STORAGE_KEYS.USERS, users)
  }
  return users
}

export function getAllUsers() {
  const users = storageGet(STORAGE_KEYS.USERS, [])
  return Array.isArray(users) ? users : []
}

export function findUserByEmail(email) {
  if (typeof email !== 'string') return null
  const normalized = email.toLowerCase().trim()
  return getAllUsers().find((u) => u.email === normalized) || null
}

export async function createUser({ name, email, password }) {
  const cleanName = String(name || '').trim().slice(0, LIMITS.name)
  const normalized = String(email || '').toLowerCase().trim()

  if (!cleanName) throw new Error('Ad soyad zorunludur.')
  if (normalized.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Geçerli bir e-posta girin.')
  }
  if (typeof password !== 'string' || password.length < LIMITS.passwordMin || password.length > LIMITS.passwordMax) {
    throw new Error(`Şifre ${LIMITS.passwordMin}-${LIMITS.passwordMax} karakter arasında olmalı.`)
  }

  const users = getAllUsers()
  if (users.some((u) => u.email === normalized)) {
    throw new Error('Bu e-posta ile zaten kayıtlı bir hesap var.')
  }
  const salt = generateSalt()
  const user = {
    id: uuid(),
    name: cleanName,
    email: normalized,
    passwordHash: await hashPassword(password, salt),
    salt,
    role: 'user', // rol her zaman 'user'; admin yalnızca sunucuda atanabilmeli
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  storageSet(STORAGE_KEYS.USERS, users)
  return user
}

// Şifre doğrula; eski SHA-256 hash'i doğruysa yeni PBKDF2 formatına yükselt.
export async function checkPassword(user, password) {
  const { ok, needsRehash } = await verifyPassword(String(password ?? ''), user.salt, user.passwordHash)
  if (ok && needsRehash) {
    const salt = generateSalt()
    const passwordHash = await hashPassword(password, salt)
    const users = getAllUsers().map((u) => (u.id === user.id ? { ...u, salt, passwordHash } : u))
    storageSet(STORAGE_KEYS.USERS, users)
  }
  return ok
}

// Kullanıcıdan hassas bilgileri temizle (session için)
export function sanitizeUser(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }
}
