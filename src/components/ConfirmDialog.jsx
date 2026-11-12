import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Onayla', cancelLabel = 'Vazgeç', onConfirm, onCancel, danger = true }) {
  const confirmRef = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    // Geri alınamaz işlemlerde varsayılan odak güvenli seçenekte (Vazgeç) olur.
    const target = danger ? cancelRef.current : confirmRef.current
    if (target) target.focus()
    // Enter tuşu odaktaki düğmeyi zaten tetikler; genel Enter dinleyicisi yanlışlıkla onaya yol açıyordu.
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, danger, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative glass-strong rounded-3xl w-full max-w-sm p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-shu/15 text-shu' : 'bg-indigo2/15 text-indigo2'}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 id="confirm-title" className="font-display font-bold text-warm">{title}</h3>
                <p className="text-sm text-muted mt-1">{message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                ref={cancelRef}
                onClick={onCancel}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl glass text-warm text-sm font-medium hover:border-shu/30 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                className={`flex-1 min-h-[44px] py-2.5 rounded-xl text-white text-sm font-semibold transition ${
                  danger ? 'bg-gradient-to-r from-shu to-shu-grad hover:brightness-110' : 'bg-indigo2 hover:brightness-110'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
