import { useState, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Search, Filter, Inbox, Tag, Truck, PackageCheck, LayoutGrid } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { useTickets } from '../hooks/useTickets.js'
import { useToast } from '../hooks/useToast.js'
import StatCard from '../components/StatCard.jsx'
import TicketCard from '../components/TicketCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Toast from '../components/Toast.jsx'
import NewTicketForm from '../components/NewTicketForm.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { STATUSES } from '../data/constants.js'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { getVisibleTickets, addTicket } = useTickets()
  const { toasts, toast, dismiss } = useToast()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const allTickets = useMemo(() => getVisibleTickets(user), [getVisibleTickets, user])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allTickets.filter((t) => {
      const matchSearch = !q || t.productName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [allTickets, search, statusFilter])

  const stats = useMemo(() => {
    const active = allTickets.filter((t) => !['delivered', 'cancelled'].includes(t.status)).length
    const inTransit = allTickets.filter((t) => ['shipped', 'awaiting_payment'].includes(t.status)).length
    const delivered = allTickets.filter((t) => t.status === 'delivered').length
    return { total: allTickets.length, active, inTransit, delivered }
  }, [allTickets])

  const openTicket = (id) => navigate(`/panel/talep/${id}`)

  const handleNew = (data) => {
    addTicket(data, user)
    setShowNew(false)
  }

  return (
    <div className="space-y-6">
      {/* Desktop tabs */}
      <div className="hidden sm:flex items-center gap-2 mb-2">
        <TabBtn active onClick={() => {}} icon={LayoutGrid}>Taleplerim</TabBtn>
        <div className="ml-auto">
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-shu to-shu-grad text-white text-sm font-semibold hover:brightness-110 transition shadow-shu-glow"
          >
            <Plus size={17} /> Yeni Talep Oluştur
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon={Inbox} label="Toplam Talep" value={stats.total} accent="indigo2" delay={0} />
              <StatCard icon={Tag} label="Aktif" value={stats.active} accent="gold" delay={0.05} />
              <StatCard icon={Truck} label="Kargoda" value={stats.inTransit} accent="shu" delay={0.1} />
              <StatCard icon={PackageCheck} label="Teslim Edildi" value={stats.delivered} accent="matcha" delay={0.15} />
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ürün adı veya JP-TR-xxxx kodu ara..."
                  aria-label="Taleplerde ara"
                  className="input-base pl-10"
                />
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Duruma göre filtrele"
                  className="input-base pl-10 pr-8 appearance-none cursor-pointer"
                >
                  <option value="All">Tüm Durumlar</option>
                  {STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <EmptyState
                title="Talep bulunamadı"
                desc={search || statusFilter !== 'All' ? 'Farklı bir arama veya filtre deneyin.' : 'Henüz talebiniz yok. İlk talebinizi oluşturun.'}
                icon={Inbox}
                action={
                  !search && statusFilter === 'All' ? (
                    <button
                      onClick={() => setShowNew(true)}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-shu to-shu-grad text-white text-sm font-semibold hover:brightness-110 transition shadow-shu-glow"
                    >
                      <Plus size={16} /> Yeni Talep Oluştur
                    </button>
                  ) : null
                }
              />
            ) : (
              <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((t) => (
                    <TicketCard key={t.id} ticket={t} onOpen={openTicket} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
      </AnimatePresence>

      {/* Mobile new button */}
      <button
        onClick={() => setShowNew(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-2xl bg-gradient-to-r from-shu to-shu-grad text-white flex items-center justify-center shadow-shu-glow"
        aria-label="Yeni talep oluştur"
      >
        <Plus size={24} />
      </button>

      <AnimatePresence>
        {showNew && (
          <NewTicketForm onSubmit={handleNew} onClose={() => setShowNew(false)} onToast={toast} />
        )}
      </AnimatePresence>

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}

function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
        active ? 'glass text-warm border-shu/30' : 'text-faint hover:text-muted'
      }`}
    >
      <Icon size={16} /> {children}
    </button>
  )
}
