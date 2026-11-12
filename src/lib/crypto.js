// Web Crypto API ile PBKDF2-SHA256 şifre hashleme
//
// ÖNEMLİ: Bu dosya tarayıcıda çalışır. Tarayıcıdaki hiçbir doğrulama gerçek güvenlik sağlamaz,
// çünkü kullanıcı kodu ve localStorage'ı değiştirebilir. Gerçek güvenlik için kimlik doğrulama
// ve yetkilendirme sunucu tarafında (Cloudflare Workers + D1) yapılmalıdır.

const encoder = new TextEncoder()

// OWASP 2023 önerisi: PBKDF2-HMAC-SHA256 için en az 600.000 tur. Tarayıcıda UX için
// 310.000 seçildi; backend'e geçilince argon2id/bcrypt kullanın.
const PBKDF2_ITERATIONS = 310_000
const HASH_PREFIX = 'pbkdf2'

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Kullanıcıya özel salt üret
export function generateSalt() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return bufferToHex(arr)
}

async function pbkdf2(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations },
    keyMaterial,
    256
  )
  return bufferToHex(bits)
}

// Eski format (v1): düz SHA-256(password:salt). Yalnızca eski hesapları doğrulamak için.
async function legacySha256(password, salt) {
  const data = encoder.encode(password + ':' + salt)
  return bufferToHex(await crypto.subtle.digest('SHA-256', data))
}

// Sabit zamanlı karşılaştırma (zamanlama saldırılarını zorlaştırır)
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Yeni hash üret → "pbkdf2$<tur>$<hash>"
export async function hashPassword(password, salt) {
  const hex = await pbkdf2(password, salt, PBKDF2_ITERATIONS)
  return `${HASH_PREFIX}$${PBKDF2_ITERATIONS}$${hex}`
}

// Şifre doğrula. Eski SHA-256 hash'leri de kabul eder ve needsRehash döner.
export async function verifyPassword(password, salt, stored) {
  if (typeof stored !== 'string') return { ok: false, needsRehash: false }

  if (stored.startsWith(HASH_PREFIX + '$')) {
    const [, iterStr, hex] = stored.split('$')
    const iterations = Number(iterStr)
    if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 2_000_000) {
      return { ok: false, needsRehash: false }
    }
    const computed = await pbkdf2(password, salt, iterations)
    return { ok: timingSafeEqual(computed, hex), needsRehash: iterations < PBKDF2_ITERATIONS }
  }

  // Eski kayıt
  const computed = await legacySha256(password, salt)
  const ok = timingSafeEqual(computed, stored)
  return { ok, needsRehash: ok }
}

// UUID üret (kriptografik rastgelelik)
export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID()
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = bufferToHex(b)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
