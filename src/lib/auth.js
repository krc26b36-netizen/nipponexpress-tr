// Auth servis arayüzü — login, register, logout, getSession
// Bu katman arayüz olarak tasarlandı; backend (Cloudflare Workers + D1) geçişinde yalnızca bu
// dosyanın içi API çağrılarıyla değiştirilecek. NOT: tarayıcı tabanlı bu sürüm demo amaçlıdır.

import { storageGet, storageSet, storageRemove, STORAGE_KEYS } from './storage.js'
import {
  ensureSeedUsers,
  findUserByEmail,
  createUser,
  checkPassword,
  sanitizeUser,
} from './userStore.js'
import { hashPassword, generateSalt } from './crypto.js'

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 saat (önceden 7 gün)

// Kaba kuvvet koruması: e-posta başına kalıcı kilit (sayfa yenilemekle sıfırlanmaz)
const LOCK_THRESHOLD = 5
const LOCK_BASE_MS = 30_000
const LOCK_MAX_MS = 15 * 60_000
const LOCKOUT_KEY = 'lockouts'

const GENERIC_LOGIN_ERROR = 'E-posta veya şifre hatalı.'

// Kullanıcı yokken de aynı süreyi harcamak için sahte hash (zamanlamayla hesap tespitini zorlaştırır)
let dummyCredPromise = null
function dummyCheck(password) {
  if (!dummyCredPromise) {
    const salt = generateSalt()
    dummyCredPromise = hashPassword('dummy-password', salt).then((hash) => ({ salt, hash }))
  }
  return dummyCredPromise.then(({ salt }) => hashPassword(String(password ?? ''), salt))
}

function readLockouts() {
  const v = storageGet(LOCKOUT_KEY, {})
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
}

function lockError(retryAfterMs) {
  const secs = Math.max(1, Math.ceil(retryAfterMs / 1000))
  const err = new Error(`Çok fazla hatalı deneme. ${secs} saniye sonra tekrar deneyin.`)
  err.retryAfterMs = retryAfterMs
  err.code = 'LOCKED'
  return err
}

function assertNotLocked(emailKey) {
  const entry = readLockouts()[emailKey]
  if (entry?.until && entry.until > Date.now()) throw lockError(entry.until - Date.now())
}

function recordFailure(emailKey) {
  const all = readLockouts()
  const entry = all[emailKey] || { count: 0, bursts: 0, until: 0 }
  entry.count += 1
  if (entry.count >= LOCK_THRESHOLD) {
    entry.bursts += 1
    entry.count = 0
    entry.until = Date.now() + Math.min(LOCK_BASE_MS * 2 ** (entry.bursts - 1), LOCK_MAX_MS)
  }
  all[emailKey] = entry
  storageSet(LOCKOUT_KEY, all)
  return entry
}

function clearFailures(emailKey) {
  const all = readLockouts()
  if (all[emailKey]) {
    delete all[emailKey]
    storageSet(LOCKOUT_KEY, all)
  }
}

function startSession(user) {
  storageSet(STORAGE_KEYS.SESSION, {
    userId: user.id,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  })
}

export async function initAuth() {
  await ensureSeedUsers()
}

export async function login(email, password, requireAdmin = false) {
  const emailKey = String(email || '').toLowerCase().trim().slice(0, 254)
  assertNotLocked(emailKey)

  const user = findUserByEmail(emailKey)
  let ok = false
  if (user) ok = await checkPassword(user, password)
  else await dummyCheck(password)

  if (!ok) {
    const entry = recordFailure(emailKey)
    if (entry.until > Date.now()) throw lockError(entry.until - Date.now())
    throw new Error(GENERIC_LOGIN_ERROR)
  }

  clearFailures(emailKey)

  // Rol kontrolü yalnızca doğru şifreden SONRA yapılır (hesap türü sızdırılmaz)
  if (requireAdmin && user.role !== 'admin') throw new Error(GENERIC_LOGIN_ERROR)
  if (!requireAdmin && user.role === 'admin') {
    throw new Error('Bu hesap bir yönetici hesabıdır. Lütfen "Admin Girişi" seçeneğini kullanın.')
  }

  startSession(user)
  return sanitizeUser(user)
}

export async function register({ name, email, password }) {
  const user = await createUser({ name, email, password })
  startSession(user)
  return sanitizeUser(user)
}

export function logout() {
  storageRemove(STORAGE_KEYS.SESSION)
}

// Mevcut oturum — süresi dolmuşsa otomatik çıkış. Rol, oturum kaydından değil kullanıcı kaydından okunur.
export function getSession() {
  const session = storageGet(STORAGE_KEYS.SESSION, null)
  if (!session) return null
  if (!session.expiresAt || Date.now() > session.expiresAt) {
    storageRemove(STORAGE_KEYS.SESSION)
    return null
  }
  const users = storageGet(STORAGE_KEYS.USERS, [])
  const user = Array.isArray(users) ? users.find((u) => u.id === session.userId) : null
  if (!user) {
    storageRemove(STORAGE_KEYS.SESSION)
    return null
  }
  return sanitizeUser(user)
}
