import { motion } from 'framer-motion'
import { STATUSES } from '../data/constants.js'

const colorMap = {
  indigo2: { dot: 'bg-indigo2', line: 'bg-indigo2' },
  shu: { dot: 'bg-shu', line: 'bg-shu' },
  gold: { dot: 'bg-gold', line: 'bg-gold' },
  matcha: { dot: 'bg-matcha', line: 'bg-matcha' },
}

export default function StatusStepper({ current, className = '' }) {
  const currentIdx = STATUSES.findIndex((s) => s.key === current)

  return (
    <div className={className}>
      {/* Desktop horizontal */}
      <div className="hidden sm:flex items-center">
        {STATUSES.map((s, i) => {
          const c = colorMap[s.color]
          const done = i <= currentIdx
          const active = i === currentIdx
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors ${
                    done
                      ? `${c.dot} text-white border-transparent`
                      : 'bg-surface2 text-faint border-edge'
                  }`}
                >
                  {i + 1}
                </motion.div>
                <span
                  className={`text-[10px] text-center leading-tight max-w-[72px] ${
                    active ? 'text-warm font-medium' : done ? 'text-muted' : 'text-faint'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STATUSES.length - 1 && (
                <div className="flex-1 h-0.5 mx-1.5 rounded-full bg-surface2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: i < currentIdx ? '100%' : 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`h-full ${c.line}`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile vertical */}
      <div className="sm:hidden space-y-0">
        {STATUSES.map((s, i) => {
          const c = colorMap[s.color]
          const done = i <= currentIdx
          const active = i === currentIdx
          return (
            <div key={s.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold border ${
                    done
                      ? `${c.dot} text-white border-transparent`
                      : 'bg-surface2 text-faint border-edge'
                  }`}
                >
                  {i + 1}
                </motion.div>
                {i < STATUSES.length - 1 && (
                  <div className="w-0.5 flex-1 my-1 rounded-full bg-surface2 overflow-hidden min-h-[20px]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: i < currentIdx ? '100%' : 0 }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                      className={`w-full ${c.line}`}
                    />
                  </div>
                )}
              </div>
              <div className="pb-3">
                <p
                  className={`text-sm ${active ? 'text-warm font-medium' : done ? 'text-muted' : 'text-faint'}`}
                >
                  {s.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
