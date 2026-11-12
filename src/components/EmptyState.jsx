import { motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'

export default function EmptyState({ title = 'Talep bulunamadı', desc = 'Farklı bir arama deneyin veya yeni bir talep oluşturun.', icon: Icon = PackageSearch, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl py-16 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface2 flex items-center justify-center mx-auto mb-4 text-faint">
        <Icon size={28} />
      </div>
      <h3 className="font-display font-semibold text-warm mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mx-auto">{desc}</p>
      {action}
    </motion.div>
  )
}
