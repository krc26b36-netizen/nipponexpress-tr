import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import SafeImage from './SafeImage.jsx'
import StatusBadge from './StatusBadge.jsx'
import { formatTRY, formatJPY, formatDate } from '../lib/format.js'

export default function TicketCard({ ticket, onOpen }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28 }}
      whileHover={{ y: -4 }}
      onClick={() => onOpen(ticket.id)}
      className="group text-left w-full glass rounded-2xl overflow-hidden hover:border-shu/30 transition-colors focus-visible:border-shu/50"
    >
      <div className="relative h-40 bg-surface2 overflow-hidden">
        <SafeImage
          src={ticket.imageUrl}
          alt={ticket.productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          iconSize={28}
        />
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[11px] px-2 py-1 rounded-lg glass-strong text-warm tnum">
            {ticket.id}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-[11px] text-faint mb-1">{ticket.category}</p>
          <h3 className="font-display font-semibold text-warm leading-snug line-clamp-2 group-hover:text-shu-hover transition-colors">
            {ticket.productName}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} className="text-faint" /> {ticket.address?.split('/')[0]?.trim() || '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} className="text-faint" /> {formatDate(ticket.createdAt)}
          </span>
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-edge">
          <div>
            <p className="text-[10px] text-faint uppercase tracking-wide">TR Tahmini</p>
            <p className="font-mono text-sm text-muted tnum">{formatTRY(ticket.trEstimatePrice)}</p>
          </div>
          {ticket.tryOffer ? (
            <div className="text-right">
              <p className="text-[10px] text-faint uppercase tracking-wide">Teklif</p>
              <p className="font-mono text-sm font-semibold text-shu tnum">
                {formatTRY(ticket.tryOffer)}
              </p>
            </div>
          ) : ticket.jpyPrice ? (
            <div className="text-right">
              <p className="text-[10px] text-faint uppercase tracking-wide">JPY</p>
              <p className="font-mono text-sm text-gold tnum">{formatJPY(ticket.jpyPrice)}</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-[10px] text-faint uppercase tracking-wide">Teklif</p>
              <p className="font-mono text-sm text-faint">Bekleniyor</p>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}
