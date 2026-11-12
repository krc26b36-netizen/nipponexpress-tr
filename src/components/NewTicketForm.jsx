import { useState, useId, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Package, Tag, Phone, MapPin, StickyNote, Image as ImageIcon, Send } from 'lucide-react'
import { CATEGORIES } from '../data/constants.js'
import { safeImageUrl } from '../lib/url.js'

const initial = {
  productName: '',
  category: CATEGORIES[0],
  trEstimatePrice: '',
  imageUrl: '',
  phone: '',
  address: '',
  notes: '',
}

function validate(v) {
  const errs = {}
  if (!v.productName.trim()) errs.productName = 'Ürün adı zorunludur.'
  if (!v.trEstimatePrice || Number(v.trEstimatePrice) <= 0)
    errs.trEstimatePrice = 'Geçerli bir tahmini fiyat girin.'
  if (!v.phone.trim()) errs.phone = 'Telefon zorunludur.'
  else if (!/^[+]?[\d\s()-]{7,}$/.test(v.phone.trim()))
    errs.phone = 'Geçerli bir telefon numarası girin.'
  if (!v.address.trim()) errs.address = 'Adres zorunludur.'
  if (v.imageUrl && !safeImageUrl(v.imageUrl))
    errs.imageUrl = 'Yalnızca https:// ile başlayan geçerli bir bağlantı girin.'
  return errs
}

export default function NewTicketForm({ onSubmit, onClose, onToast }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const titleId = useId()

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (k, val) => {
    setForm((f) => ({ ...f, [k]: val }))
    if (touched[k]) {
      const e = validate({ ...form, [k]: val })
      setErrors((p) => ({ ...p, [k]: e[k] }))
    }
  }

  const blur = (k) => {
    setTouched((t) => ({ ...t, [k]: true }))
    const e = validate(form)
    setErrors((p) => ({ ...p, [k]: e[k] }))
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    setTouched(Object.keys(initial).reduce((o, k) => ({ ...o, [k]: true }), {}))
    if (Object.keys(errs).length) {
      onToast('Lütfen formdaki hataları düzeltin', 'error')
      return
    }
    onSubmit(form)
    onToast('Talebiniz oluşturuldu', 'success')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative glass-strong rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="sticky top-0 z-10 glass-strong px-5 py-4 flex items-center justify-between border-b border-edge">
          <h2 id={titleId} className="font-display font-bold text-lg text-warm">Yeni Talep Oluştur</h2>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="w-11 h-11 rounded-xl glass flex items-center justify-center text-muted hover:text-shu transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <Field icon={Package} label="Ürün Adı" error={touched.productName && errors.productName}>
            <input
              autoFocus
              value={form.productName}
              onChange={(e) => set('productName', e.target.value)}
              onBlur={() => blur('productName')}
              maxLength={160}
              placeholder="örn. Sony WH-1000XM5 Kulaklık"
              className="input-base"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field icon={Tag} label="Kategori">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="input-base"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field
              icon={Tag}
              label="TR Tahmini Fiyat (TRY)"
              error={touched.trEstimatePrice && errors.trEstimatePrice}
            >
              <input
                type="number"
                value={form.trEstimatePrice}
                onChange={(e) => set('trEstimatePrice', e.target.value)}
                onBlur={() => blur('trEstimatePrice')}
                placeholder="örn. 12000"
                className="input-base font-mono tnum"
              />
            </Field>
          </div>

          <Field
            icon={ImageIcon}
            label="Görsel URL"
            error={touched.imageUrl && errors.imageUrl}
          >
            <input
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              onBlur={() => blur('imageUrl')}
              maxLength={2048}
              inputMode="url"
              autoComplete="off"
              placeholder="https://..."
              className="input-base"
            />
          </Field>

          <Field icon={Phone} label="Telefon" error={touched.phone && errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              onBlur={() => blur('phone')}
              maxLength={30}
              inputMode="tel"
              autoComplete="tel"
              placeholder="+90 5xx xxx xx xx"
              className="input-base"
            />
          </Field>

          <Field icon={MapPin} label="Teslimat Adresi" error={touched.address && errors.address}>
            <textarea
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              onBlur={() => blur('address')}
              rows={2}
              maxLength={500}
              autoComplete="street-address"
              placeholder="Mahalle, sokak, ilçe / şehir"
              className="input-base resize-none"
            />
          </Field>

          <Field icon={StickyNote} label="Notlar">
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Renk, boyut, özel istekler..."
              className="input-base resize-none"
            />
          </Field>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-shu to-shu-grad text-white font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition shadow-shu-glow"
          >
            <Send size={18} /> Talebi Gönder
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

// <label>, çocuk girdiyi sarar; böylece ekran okuyucular etiketi alanla ilişkilendirir.
function Field({ icon: Icon, label, error, children }) {
  const errId = useId()
  return (
    <div>
      <label className="block">
        <span className="text-xs text-muted mb-1.5 flex items-center gap-1.5">
          <Icon size={12} aria-hidden="true" /> {label}
        </span>
        {children}
      </label>
      {error && <p id={errId} role="alert" className="text-xs text-shu mt-1">{error}</p>}
    </div>
  )
}
