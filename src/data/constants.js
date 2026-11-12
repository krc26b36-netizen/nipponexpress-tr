// Tek yerde tanımlı sabitler — durumlar, kategoriler, roller

// Durumlar (sıralı akış)
export const STATUSES = [
  { key: 'received', label: 'Talep Alındı', color: 'indigo2', icon: 'Inbox' },
  { key: 'searching', label: "Japonya'da Aranıyor", color: 'gold', icon: 'Search' },
  { key: 'quoted', label: 'Fiyat Teklifi Verildi', color: 'gold', icon: 'Tag' },
  { key: 'awaiting_payment', label: 'Ödeme Bekliyor', color: 'shu', icon: 'CreditCard' },
  { key: 'shipped', label: 'Kargoya Verildi', color: 'matcha', icon: 'Truck' },
  { key: 'delivered', label: 'Teslim Edildi', color: 'indigo2', icon: 'PackageCheck' },
]

export const STATUS_KEYS = STATUSES.map((s) => s.key)

export const STATUS_LABEL = Object.fromEntries(
  STATUSES.map((s) => [s.key, s.label])
)

export const STATUS_COLOR = Object.fromEntries(
  STATUSES.map((s) => [s.key, s.color])
)

export const STATUS_NOTE = {
  received: 'Talebiniz alındı.',
  searching: "Japonya'da tedarikçilerde aramaya başlandı.",
  quoted: 'Fiyat teklifi hazırlandı.',
  awaiting_payment: 'Ödeme onayınız bekleniyor.',
  shipped: 'Ürün kargoya verildi.',
  delivered: 'Teslim edildi.',
}

export const CATEGORIES = [
  'Elektronik',
  'Anime & Manga',
  'Moda & Giyim',
  'Kozmetik',
  'Gıda & İçecek',
  'Koleksiyon',
  'Kitap & Hobi',
  'Diğer',
]

export const ROLES = {
  user: 'Müşteri',
  admin: 'Japonya Ekibi (Admin)',
}
