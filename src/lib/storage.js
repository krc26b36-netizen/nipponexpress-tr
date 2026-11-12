// Versiyonlu localStorage yardımcıları — try/catch ile güvenli okuma/yazma
// Eski veri varsa güvenli şekilde migrate et ya da sıfırla.

const SCHEMA_VERSION = 'v2'

function key(name) {
  return `nx_${SCHEMA_VERSION}_${name}`
}

export function storageGet(name, fallback = null) {
  try {
    const raw = localStorage.getItem(key(name))
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.warn(`storageGet(${name}) başarısız:`, e)
    return fallback
  }
}

export function storageSet(name, value) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value))
    return true
  } catch (e) {
    console.warn(`storageSet(${name}) başarısız:`, e)
    return false
  }
}

export function storageRemove(name) {
  try {
    localStorage.removeItem(key(name))
  } catch (e) {
    /* ignore */
  }
}

// Eski v1 anahtarlarını temizle (migrate)
export function cleanupLegacy() {
  const legacyKeys = ['nextr_tickets_v1', 'nextr_auth_v1', 'nextr_theme_v1']
  legacyKeys.forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch (e) {
      /* ignore */
    }
  })
}

export const STORAGE_KEYS = {
  USERS: 'users',
  SESSION: 'session',
  TICKETS: 'tickets',
  THEME: 'theme',
}
