// JPY → TRY teklif hesaplama — tek yerde tanımlı kur ve marj

// JPY -> TRY kuru (tahmini). "Anlık garanti" değil, dürüst "tahmini kur".
export const JPY_TO_TRY_RATE = 0.22

// Varsayılan servis marjı (%25)
export const DEFAULT_MARGIN = 25

// Tam teklif hesapla: (jpy + kargoJPY) × kur × (1 + marj/100)
export function calcTryOffer(jpyPrice, kargoJPY = 0, marginPct = DEFAULT_MARGIN) {
  const jpy = Number(jpyPrice) || 0
  const kargo = Number(kargoJPY) || 0
  if (jpy <= 0 && kargo <= 0) return null
  const base = (jpy + kargo) * JPY_TO_TRY_RATE
  return Math.round(base * (1 + marginPct / 100))
}

// Toplam teklif kalemleri (admin panelde gösterilir)
export function priceBreakdown(jpyPrice, kargoJPY = 0, marginPct = DEFAULT_MARGIN) {
  const jpy = Number(jpyPrice) || 0
  const kargo = Number(kargoJPY) || 0
  if (jpy <= 0 && kargo <= 0) return null
  const subtotal = (jpy + kargo) * JPY_TO_TRY_RATE
  const margin = subtotal * (marginPct / 100)
  return {
    productTRY: Math.round(jpy * JPY_TO_TRY_RATE),
    kargoTRY: Math.round(kargo * JPY_TO_TRY_RATE),
    base: Math.round(subtotal),
    margin: Math.round(margin),
    total: Math.round(subtotal + margin),
  }
}
