// Kullanıcıdan gelen URL'leri güvenli hale getiren yardımcılar

// Yalnızca https:// adreslerine izin verir (javascript:, data:, http: reddedilir). Geçersizse '' döner.
export function safeImageUrl(value) {
  if (typeof value !== 'string') return ''
  const v = value.trim()
  if (!v || v.length > 2048) return ''
  try {
    const u = new URL(v)
    return u.protocol === 'https:' ? u.href : ''
  } catch {
    return ''
  }
}

// tel: bağlantısı için yalnızca rakam, +, boşluk, parantez ve tire kabul eder
export function safeTelHref(phone) {
  const cleaned = String(phone || '').replace(/[^\d+]/g, '')
  return cleaned.length >= 7 ? `tel:${cleaned}` : undefined
}
