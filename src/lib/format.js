// Intl tabanlı Türkçe biçimlendiriciler

const tryFmt = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})

const jpyFmt = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
})

const numFmt = new Intl.NumberFormat('tr-TR')

const dateFmt = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFmt = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const timeFmt = new Intl.DateTimeFormat('tr-TR', {
  hour: '2-digit',
  minute: '2-digit',
})

export function formatTRY(n) {
  if (n == null || isNaN(n)) return '—'
  return tryFmt.format(n)
}

export function formatJPY(n) {
  if (n == null || isNaN(n)) return '—'
  return jpyFmt.format(n)
}

export function formatNum(n) {
  if (n == null || isNaN(n)) return '—'
  return numFmt.format(n)
}

export function formatDate(iso) {
  if (!iso) return '—'
  return dateFmt.format(new Date(iso))
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  return dateTimeFmt.format(new Date(iso))
}

export function formatTime(iso) {
  if (!iso) return '—'
  return timeFmt.format(new Date(iso))
}

// Göreceli zaman (örn. "3 gün önce")
export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'az önce'
  if (min < 60) return `${min} dk önce`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} saat önce`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} gün önce`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo} ay önce`
  return `${Math.floor(mo / 12)} yıl önce`
}

// CSV için güvenli alan: virgül/tırnak kaçışı + formül enjeksiyonu (CSV injection) koruması.
// Excel/Sheets; "=", "+", "-", "@", sekme veya satır başı ile başlayan metni formül olarak çalıştırabilir.
// Kullanıcıdan gelen metinlerin başına tek tırnak eklenerek düz metin olarak açılması sağlanır.
export function csvEscape(value) {
  if (value == null) return ''
  let s = String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
