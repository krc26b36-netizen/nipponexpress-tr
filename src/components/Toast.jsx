import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={`glass-strong rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-sm shadow-glow pointer-events-auto ${
              t.type === 'success'
                ? 'text-matcha'
                : t.type === 'error'
                ? 'text-shu'
                : 'text-indigo2'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 size={17} /> : t.type === 'error' ? <AlertCircle size={17} /> : <Info size={17} />}
            <span className="text-warm">{t.message}</span>
            {onDismiss && (
              <button onClick={() => onDismiss(t.id)} className="text-faint hover:text-warm transition-colors ml-1" aria-label="Kapat">
                <X size={14} />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
