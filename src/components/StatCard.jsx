import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, accent = 'indigo2', delay = 0 }) {
  const colorMap = {
    indigo2: 'text-indigo2 bg-indigo2/10',
    shu: 'text-shu bg-shu/10',
    gold: 'text-gold bg-gold/10',
    matcha: 'text-matcha bg-matcha/10',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -3 }}
      className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-shu/30 transition-colors"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[accent]}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-faint font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl sm:text-2xl font-display font-bold text-warm tnum mt-0.5">{value}</p>
      </div>
    </motion.div>
  )
}
