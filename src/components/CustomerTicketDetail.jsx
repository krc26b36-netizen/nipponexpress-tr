import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  ArrowLeft, MapPin, Phone, StickyNote, Truck, Tag,
  CheckCircle2, XCircle, Ban, Sparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import StatusStepper from './StatusStepper.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import SafeImage from './SafeImage.jsx'
import { STATUSES, STATUS_LABEL } from '../data/constants.js'
import { formatTRY, formatJPY, formatDateTime, timeAgo } from '../lib/format.js'
import { calcTryOffer, priceBreakdown, JPY_TO_TRY_RATE } from '../lib/pricing.js'

const colorMap = {
  indigo2: 'bg-indigo2',
  shu: 'bg-shu',
  gold: 'bg-gold',
  matcha: 'bg-matcha',
}

export default function CustomerTicketDetail({ ticket, onAcceptOffer, onRejectOffer, onCancel, onToast }) {
  const navigate = useNavigate()
  const [showReject, setShowReject] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [showCancel, setShowCancel] = useState(false)

  if (!ticket) return null
  const offer = ticket.tryOffer || calcTryOffer(ticket.jpyPrice, ticket.kargoJPY, ticket.marginPct)
  const breakdown = priceBreakdown(ticket.jpyPrice, ticket.kargoJPY, ticket.marginPct)
  const aiHint = buildAiHint(ticket, offer)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      <button
        onClick={() => navigate('/panel')}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-warm transition-colors"
      >
        <ArrowLeft size={16} /> Taleplere dön
      </button>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: product + delivery */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="relative h-56 sm:h-64 bg-surface2">
              <SafeImage
                src={ticket.imageUrl}
                alt={ticket.productName}
                className="w-full h-full object-cover"
                iconSize={36}
                label="Görsel bulunamadı"
              />
              <div className="absolute top-3 left-3">
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg glass-strong text-warm tnum">
                  {ticket.id}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={ticket.status} size="md" />
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-faint mb-1">{ticket.category}</p>
                <h2 className="font-display font-bold text-xl text-warm">{ticket.productName}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoRow icon={Tag} label="TR Tahmini Fiyat" value={formatTRY(ticket.trEstimatePrice)} />
                <InfoRow icon={Truck} label="Takip Kodu" value={ticket.trackingCode || '—'} mono />
                <InfoRow icon={Phone} label="Telefon" value={ticket.phone} />
                <InfoRow icon={MapPin} label="Adres" value={ticket.address} />
                <InfoRow icon={StickyNote} label="Notlar" value={ticket.notes || '—'} full />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold text-warm mb-4">Zaman Çizelgesi</h3>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-edge" />
              {ticket.timeline.map((entry, i) => {
                const s = STATUSES.find((x) => x.key === entry.status)
                const c = colorMap[s?.color || 'indigo2']
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative pb-5 last:pb-0"
                  >
                    <span className={`absolute -left-[22px] top-0.5 w-3.5 h-3.5 rounded-full ${c} ring-4 ring-ink`} />
                    <p className="text-sm font-medium text-warm">{STATUS_LABEL[entry.status] || entry.status}</p>
                    {entry.note && <p className="text-xs text-muted mt-0.5">{entry.note}</p>}
                    <p className="text-[11px] text-faint mt-1 tnum">
                      {formatDateTime(entry.at)} · {timeAgo(entry.at)}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: status + offer */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold text-warm mb-4">Durum Takibi</h3>
            <StatusStepper current={ticket.status} />
          </div>

          {/* Offer box */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="font-display font-semibold text-warm">Fiyat Teklifi</h3>
            {offer ? (
              <>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-faint">Toplam Teklif</p>
                    <p className="font-mono text-3xl font-bold text-shu tnum">{formatTRY(offer)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-faint">JPY Fiyatı</p>
                    <p className="font-mono text-sm text-gold tnum">{formatJPY(ticket.jpyPrice)}</p>
                  </div>
                </div>
                {breakdown && (
                  <div className="pt-3 border-t border-edge space-y-1.5 text-xs">
                    <Row label="Ürün tutarı (JPY × kur)" value={formatTRY(breakdown.productTRY)} />
                    {ticket.kargoJPY > 0 && (
                      <Row label="Kargo (JPY × kur)" value={formatTRY(breakdown.kargoTRY)} />
                    )}
                    <Row label={`Servis marjı (%${ticket.marginPct || 25})`} value={formatTRY(breakdown.margin)} />
                    <Row label="Tahmini kur (1 JPY)" value={`${JPY_TO_TRY_RATE} TRY`} muted />
                  </div>
                )}

                {/* Accept / Reject buttons */}
                {ticket.status === 'quoted' && (
                  <div className="pt-3 space-y-2">
                    <button
                      onClick={() => {
                        onAcceptOffer(ticket.id)
                        onToast('Teklif kabul edildi. Ödeme bekleniyor.', 'success')
                      }}
                      className="w-full py-2.5 rounded-xl bg-matcha/15 text-matcha text-sm font-semibold flex items-center justify-center gap-2 hover:bg-matcha/25 transition-colors"
                    >
                      <CheckCircle2 size={16} /> Teklifi Kabul Et
                    </button>
                    <button
                      onClick={() => setShowReject(true)}
                      className="w-full py-2.5 rounded-xl bg-shu/12 text-shu text-sm font-semibold flex items-center justify-center gap-2 hover:bg-shu/20 transition-colors"
                    >
                      <XCircle size={16} /> Teklifi Reddet
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">
                Henüz teklif hazırlanmadı. Japonya ekibi en uygun fiyatı araştırıyor.
              </p>
            )}
          </div>

          {/* AI hint */}
          <div className="glass rounded-2xl p-5 border-shu/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-shu" />
              <h3 className="font-display font-semibold text-warm text-sm">Akıllı Tahmin</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">{aiHint}</p>
          </div>

          {/* Cancel button — only in received status */}
          {ticket.status === 'received' && (
            <button
              onClick={() => setShowCancel(true)}
              className="w-full py-2.5 rounded-xl glass text-shu text-sm font-medium flex items-center justify-center gap-2 hover:bg-shu/10 transition-colors"
            >
              <Ban size={16} /> Talebi İptal Et
            </button>
          )}
        </div>
      </div>

      {/* Reject dialog */}
      <ConfirmDialog
        open={showReject}
        title="Teklifi Reddet"
        message="Teklifi reddetmek istediğinize emin misiniz? Talebiniz 'Talep Alındı' durumuna dönecek."
        confirmLabel="Reddet"
        cancelLabel="Vazgeç"
        onCancel={() => setShowReject(false)}
        onConfirm={() => {
          onRejectOffer(ticket.id, rejectNote)
          setShowReject(false)
          setRejectNote('')
          onToast('Teklif reddedildi', 'info')
        }}
      />

      {/* Cancel dialog */}
      <ConfirmDialog
        open={showCancel}
        title="Talebi İptal Et"
        message="Bu talebi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="İptal Et"
        cancelLabel="Vazgeç"
        onCancel={() => setShowCancel(false)}
        onConfirm={() => {
          onCancel(ticket.id)
          setShowCancel(false)
          onToast('Talep iptal edildi', 'info')
          navigate('/panel')
        }}
      />
    </motion.div>
  )
}

function InfoRow({ icon: Icon, label, value, mono, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="text-[11px] text-faint uppercase tracking-wide flex items-center gap-1 mb-1">
        <Icon size={11} /> {label}
      </p>
      <p className={`text-sm text-warm ${mono ? 'font-mono tnum' : ''}`}>{value}</p>
    </div>
  )
}

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-faint">{label}</span>
      <span className={`font-mono tnum ${muted ? 'text-faint' : 'text-muted'}`}>{value}</span>
    </div>
  )
}

function buildAiHint(ticket, offer) {
  const parts = []
  if (ticket.trEstimatePrice > 0 && offer) {
    const diff = offer - ticket.trEstimatePrice
    const pct = Math.round((diff / ticket.trEstimatePrice) * 100)
    if (pct > 0) {
      parts.push(`Tahmini teklif, TR fiyat beklentinizin yaklaşık %${pct} üzerinde. Bu fark kargo ve gümrük maliyetlerinden kaynaklanıyor.`)
    } else if (pct < 0) {
      parts.push(`Tahmini teklif, TR fiyat beklentinizin yaklaşık %${Math.abs(pct)} altında — Japonya'dan doğrudan tedarik avantajı.`)
    } else {
      parts.push('Tahmini teklif, TR fiyat beklentinizle uyumlu görünüyor.')
    }
  } else {
    parts.push('Teklif hazırlandığında, TR tahmininizle karşılaştırmalı bir analiz burada görünecek.')
  }
  const stage = STATUSES.findIndex((s) => s.key === ticket.status)
  if (stage <= 1) parts.push('Japonya ekibi tedarikçilerde en uygun fiyatı arıyor; teklif 1-3 gün içinde hazır olur.')
  else if (ticket.status === 'awaiting_payment') parts.push('Ödemenizi tamamladığınızda kargo süreci başlayacak.')
  else if (ticket.status === 'shipped') parts.push("Kargo Tokyo'dan İstanbul'a yolda; teslimat 5-10 iş günü sürer.")
  else if (ticket.status === 'delivered') parts.push('Talebiniz tamamlandı. Yeni bir tedarik talebi açabilirsiniz.')
  return parts.join(' ')
}
