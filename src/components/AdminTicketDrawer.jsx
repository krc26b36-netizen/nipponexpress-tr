import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import {
  X, MapPin, Phone, StickyNote, Truck, Tag, Calculator,
  Copy, Check, ChevronLeft, ChevronRight, ZoomIn, AlertCircle, Send,
} from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import StatusStepper from './StatusStepper.jsx'
import SafeImage from './SafeImage.jsx'
import { safeImageUrl, safeTelHref } from '../lib/url.js'
import { STATUSES, STATUS_LABEL } from '../data/constants.js'
import { formatTRY, formatJPY, formatDateTime, timeAgo } from '../lib/format.js'
import { calcTryOffer, priceBreakdown, JPY_TO_TRY_RATE } from '../lib/pricing.js'

const colorMap = {
  indigo2: 'bg-indigo2',
  shu: 'bg-shu',
  gold: 'bg-gold',
  matcha: 'bg-matcha',
}

export default function AdminTicketDrawer({
  ticket,
  tickets,
  onClose,
  onNavigate,
  onUpdateStatus,
  onSendOffer,
  onSetTracking,
  onSetInternalNote,
  onToast,
}) {
  const [jpyPrice, setJpyPrice] = useState('')
  const [kargoJPY, setKargoJPY] = useState('')
  const [marginPct, setMarginPct] = useState(25)
  const [trackingCode, setTrackingCode] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [dirty, setDirty] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const drawerRef = useRef(null)

  // Sync form when ticket changes
  useEffect(() => {
    if (ticket) {
      setJpyPrice(ticket.jpyPrice != null ? String(ticket.jpyPrice) : '')
      setKargoJPY(ticket.kargoJPY ? String(ticket.kargoJPY) : '')
      setMarginPct(ticket.marginPct || 25)
      setTrackingCode(ticket.trackingCode || '')
      setInternalNote(ticket.internalNote || '')
      setDirty(false)
    }
  }, [ticket?.id])

  // Esc to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (zoom) setZoom(false)
        else if (dirty) setConfirmClose(true)
        else onClose()
      }
      if (e.key === 'ArrowRight') onNavigate(1)
      if (e.key === 'ArrowLeft') onNavigate(-1)
    }
    if (ticket) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ticket, dirty, zoom, onClose, onNavigate])

  // Live TL preview
  const liveOffer = useMemo(() => {
    const jpy = Number(jpyPrice) || 0
    const kargo = Number(kargoJPY) || 0
    if (jpy <= 0 && kargo <= 0) return null
    return calcTryOffer(jpy, kargo, Number(marginPct) || 0)
  }, [jpyPrice, kargoJPY, marginPct])

  const liveBreakdown = useMemo(() => {
    const jpy = Number(jpyPrice) || 0
    const kargo = Number(kargoJPY) || 0
    if (jpy <= 0 && kargo <= 0) return null
    return priceBreakdown(jpy, kargo, Number(marginPct) || 0)
  }, [jpyPrice, kargoJPY, marginPct])

  const handleSendOffer = () => {
    const jpy = Number(jpyPrice) || 0
    if (jpy <= 0) {
      onToast('Lütfen JPY satın alım fiyatı girin', 'error')
      return
    }
    onSendOffer(ticket.id, { jpyPrice: jpy, kargoJPY: Number(kargoJPY) || 0, marginPct: Number(marginPct) || 25 })
    setDirty(false)
    onToast('Teklif gönderildi', 'success')
  }

  const handleSaveTracking = () => {
    if (ticket.status === 'shipped' && !trackingCode.trim()) {
      onToast('Kargoya verildi durumunda takip kodu zorunludur', 'error')
      return
    }
    onSetTracking(ticket.id, trackingCode.trim())
    onToast('Takip kodu kaydedildi', 'success')
  }

  const handleSaveNote = () => {
    onSetInternalNote(ticket.id, internalNote.trim())
    onToast('İç not kaydedildi', 'success')
  }

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'shipped' && !trackingCode.trim()) {
      onToast('Kargoya verildi durumunda takip kodu zorunludur', 'error')
      return
    }
    onUpdateStatus(ticket.id, newStatus, '', null, 'admin')
    onToast('Durum güncellendi', 'success')
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(ticket.address || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const attemptClose = () => {
    if (dirty) setConfirmClose(true)
    else onClose()
  }

  if (!ticket) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex justify-end"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={attemptClose} />

        <motion.div
          ref={drawerRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative glass-strong w-full max-w-[560px] h-full overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`Talep ${ticket.id}`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 glass-strong px-5 py-4 flex items-center justify-between border-b border-edge">
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate(-1)} aria-label="Önceki talep" className="w-11 h-11 sm:w-8 sm:h-8 rounded-lg glass flex items-center justify-center text-muted hover:text-warm transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => onNavigate(1)} aria-label="Sonraki talep" className="w-11 h-11 sm:w-8 sm:h-8 rounded-lg glass flex items-center justify-center text-muted hover:text-warm transition-colors">
                <ChevronRight size={18} />
              </button>
              <span className="font-mono text-sm text-warm tnum ml-1">{ticket.id}</span>
            </div>
            <button onClick={attemptClose} aria-label="Kapat" className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-shu transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Big image */}
            <div
              className={`relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-surface2 group ${safeImageUrl(ticket.imageUrl) ? 'cursor-zoom-in' : ''}`}
              onClick={() => safeImageUrl(ticket.imageUrl) && setZoom(true)}
              {...(safeImageUrl(ticket.imageUrl)
                ? {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': 'Görseli büyüt',
                    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZoom(true) } },
                  }
                : {})}
            >
              <SafeImage
                src={ticket.imageUrl}
                alt={ticket.productName}
                className="w-full h-full object-cover"
                iconSize={36}
                label="Görsel bulunamadı"
              />
              {safeImageUrl(ticket.imageUrl) && (
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-lg glass-strong flex items-center justify-center text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={16} />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <StatusBadge status={ticket.status} size="md" />
              </div>
            </div>

            {/* Product info */}
            <div>
              <p className="text-xs text-faint mb-1">{ticket.category}</p>
              <h2 className="font-display font-bold text-xl text-warm">{ticket.productName}</h2>
            </div>

            {/* Customer info */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-display font-semibold text-warm text-sm flex items-center gap-2">
                <Tag size={14} className="text-faint" /> Müşteri Bilgileri
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-faint uppercase tracking-wide mb-1">Ad Soyad</p>
                  <p className="text-sm font-medium text-warm">{ticket.customerEmail?.split('@')[0] || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-faint uppercase tracking-wide mb-1">E-posta</p>
                  <p className="text-sm text-muted truncate">{ticket.customerEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-faint uppercase tracking-wide mb-1">Telefon</p>
                  {ticket.phone ? (
                    <a href={safeTelHref(ticket.phone)} className="text-sm text-indigo2 hover:underline inline-flex items-center gap-1">
                      <Phone size={12} /> {ticket.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-faint">—</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-faint uppercase tracking-wide mb-1">TR Tahmini</p>
                  <p className="text-sm font-mono text-muted tnum">{formatTRY(ticket.trEstimatePrice)}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-faint uppercase tracking-wide flex items-center gap-1">
                    <MapPin size={11} /> Adres
                  </p>
                  <button onClick={copyAddress} className="text-[11px] text-faint hover:text-warm transition-colors inline-flex items-center gap-1">
                    {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
                <p className="text-sm text-warm">{ticket.address || '—'}</p>
              </div>
              <div>
                <p className="text-[11px] text-faint uppercase tracking-wide mb-1 flex items-center gap-1">
                  <StickyNote size={11} /> Müşteri Notu
                </p>
                <p className="text-sm text-muted">{ticket.notes || '—'}</p>
              </div>
            </div>

            {/* Status stepper + change */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-display font-semibold text-warm text-sm">Durum Takibi</h3>
              <StatusStepper current={ticket.status} />
              <div className="pt-2 border-t border-edge">
                <label className="text-xs text-faint mb-1.5 block">Durum Değiştir</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="input-base"
                >
                  {STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price quote editor */}
            <div className="glass rounded-2xl p-4 space-y-3 border-gold/20">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-gold" />
                <h3 className="font-display font-semibold text-warm text-sm">Fiyat Teklifi Düzenle</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-faint mb-1 block">JPY Satın Alım</label>
                  <input
                    type="number"
                    value={jpyPrice}
                    onChange={(e) => { setJpyPrice(e.target.value); setDirty(true) }}
                    placeholder="örn. 38500"
                    className="input-base font-mono tnum"
                  />
                </div>
                <div>
                  <label className="text-xs text-faint mb-1 block">Tahmini Kargo (JPY)</label>
                  <input
                    type="number"
                    value={kargoJPY}
                    onChange={(e) => { setKargoJPY(e.target.value); setDirty(true) }}
                    placeholder="örn. 2000"
                    className="input-base font-mono tnum"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-faint mb-1 block">Servis Marjı (%)</label>
                <input
                  type="number"
                  value={marginPct}
                  onChange={(e) => { setMarginPct(e.target.value); setDirty(true) }}
                  className="input-base font-mono tnum"
                />
              </div>

              {/* Live preview */}
              {liveOffer != null && (
                <div className="bg-surface2 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-faint">Canlı TL Teklif Önizleme</span>
                    <span className="font-mono text-xl font-bold text-shu tnum">{formatTRY(liveOffer)}</span>
                  </div>
                  {liveBreakdown && (
                    <div className="pt-2 border-t border-edge space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-faint">Ürün (JPY × {JPY_TO_TRY_RATE})</span><span className="font-mono text-muted tnum">{formatTRY(liveBreakdown.productTRY)}</span></div>
                      {Number(kargoJPY) > 0 && <div className="flex justify-between"><span className="text-faint">Kargo (JPY × {JPY_TO_TRY_RATE})</span><span className="font-mono text-muted tnum">{formatTRY(liveBreakdown.kargoTRY)}</span></div>}
                      <div className="flex justify-between"><span className="text-faint">Marj (%{marginPct})</span><span className="font-mono text-muted tnum">{formatTRY(liveBreakdown.margin)}</span></div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSendOffer}
                disabled={!jpyPrice || Number(jpyPrice) <= 0}
                className="w-full py-2.5 rounded-xl bg-gold/15 text-gold text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gold/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} /> Teklifi Gönder
              </button>
            </div>

            {/* Tracking code */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-display font-semibold text-warm text-sm flex items-center gap-2">
                <Truck size={14} className="text-faint" /> Kargo Takip Kodu
                {ticket.status === 'shipped' && <span className="text-[10px] text-shu">(zorunlu)</span>}
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => { setTrackingCode(e.target.value); setDirty(true) }}
                  placeholder="örn. JP-TRK-8842"
                  className="input-base font-mono tnum flex-1"
                />
                <button
                  onClick={handleSaveTracking}
                  className="px-4 py-2 rounded-xl glass text-warm text-sm font-medium hover:border-shu/30 transition-colors whitespace-nowrap"
                >
                  Kaydet
                </button>
              </div>
            </div>

            {/* Internal note */}
            <div className="glass rounded-2xl p-4 space-y-3 border-gold/15">
              <h3 className="font-display font-semibold text-warm text-sm flex items-center gap-2">
                <StickyNote size={14} className="text-gold" /> İç Not (müşteri görmez)
              </h3>
              <textarea
                value={internalNote}
                onChange={(e) => { setInternalNote(e.target.value); setDirty(true) }}
                rows={2}
                placeholder="Sadece admin görebilir..."
                className="input-base resize-none"
              />
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl glass text-warm text-sm font-medium hover:border-shu/30 transition-colors"
              >
                Notu Kaydet
              </button>
            </div>

            {/* Timeline */}
            <div className="glass rounded-2xl p-4">
              <h3 className="font-display font-semibold text-warm text-sm mb-4">Zaman Çizelgesi</h3>
              <div className="relative pl-6">
                <div className="absolute left-[7px] top-1 bottom-1 w-px bg-edge" />
                {ticket.timeline.map((entry, i) => {
                  const s = STATUSES.find((x) => x.key === entry.status)
                  const c = colorMap[s?.color || 'indigo2']
                  return (
                    <div key={i} className="relative pb-4 last:pb-0">
                      <span className={`absolute -left-[22px] top-0.5 w-3.5 h-3.5 rounded-full ${c} ring-4 ring-ink`} />
                      <p className="text-sm font-medium text-warm">{STATUS_LABEL[entry.status] || entry.status}</p>
                      {entry.note && <p className="text-xs text-muted mt-0.5">{entry.note}</p>}
                      <p className="text-[11px] text-faint mt-1 tnum">
                        {formatDateTime(entry.at)} · {timeAgo(entry.at)} · {entry.actor || 'system'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Image zoom overlay */}
          <AnimatePresence>
            {zoom && safeImageUrl(ticket.imageUrl) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[65] flex items-center justify-center p-8 bg-black/80"
                onClick={() => setZoom(false)}
              >
                <img src={safeImageUrl(ticket.imageUrl)} alt={ticket.productName} referrerPolicy="no-referrer" className="max-w-full max-h-full rounded-2xl object-contain" />
                <button className="absolute top-4 right-4 w-11 h-11 rounded-xl glass-strong flex items-center justify-center text-warm" aria-label="Kapat">
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unsaved changes confirm */}
          <AnimatePresence>
            {confirmClose && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[65] flex items-center justify-center p-4"
              >
                <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmClose(false)} />
                <motion.div
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.92 }}
                  className="relative glass-strong rounded-3xl w-full max-w-sm p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-warm">Kaydedilmemiş değişiklikler</h3>
                      <p className="text-sm text-muted mt-1">Kaydetmediğiniz değişiklikler kaybolacak. Devam edilsin mi?</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmClose(false)} className="flex-1 py-2.5 rounded-xl glass text-warm text-sm font-medium hover:border-shu/30 transition-colors">
                      İptal
                    </button>
                    <button onClick={() => { setConfirmClose(false); onClose() }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-shu to-shu-grad text-white text-sm font-semibold hover:brightness-110 transition">
                      Kapat
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
