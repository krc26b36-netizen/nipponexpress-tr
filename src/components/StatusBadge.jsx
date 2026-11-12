import { STATUS_LABEL, STATUS_COLOR } from '../data/constants.js'

const styles = {
  indigo2: 'text-indigo2 bg-indigo2/12 border-indigo2/25',
  shu: 'text-shu bg-shu/12 border-shu/25',
  gold: 'text-gold bg-gold/12 border-gold/25',
  matcha: 'text-matcha bg-matcha/12 border-matcha/25',
}

export default function StatusBadge({ status, size = 'sm' }) {
  const color = STATUS_COLOR[status] || 'indigo2'
  const label = STATUS_LABEL[status] || status
  const sz = size === 'sm' ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sz} ${styles[color]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
