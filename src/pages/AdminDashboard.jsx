import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Download, ChevronUp, ChevronDown, ChevronsUpDown,
  Inbox, Tag, Truck, CreditCard, X, Check, Package,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { useTickets } from '../hooks/useTickets.js'
import { useToast } from '../hooks/useToast.js'
import StatusBadge from '../components/StatusBadge.jsx'
import AdminTicketDrawer from '../components/AdminTicketDrawer.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Toast from '../components/Toast.jsx'
import { STATUSES, STATUS_LABEL, CATEGORIES } from '../data/constants.js'
import { formatTRY, formatDate, csvEscape } from '../lib/format.js'

const PAGE_SIZES = [10, 25, 50]

export default function AdminDashboard() {
  const { user } = useAuth()
  const {
    tickets, updateStatus, sendOffer, setTrackingCode, setInternalNote, bulkUpdateStatus,
  } = useTickets()
  const { toasts, toast, dismiss } = useToast()

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [customerFilter, setCustomerFilter] = useState('All')
  const [density, setDensity] = useState('comfortable') // comfortable | compact

  // Sorting
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Selection
  const [selected, setSelected] = useState(new Set())
  const [bulkStatus, setBulkStatus] = useState('')

  // Drawer
  const [drawerId, setDrawerId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Keyboard nav
  const [activeRow, setActiveRow] = useState(-1)
  const tableRef = useRef(null)

  // Unique customers
  const customers = useMemo(() => {
    const map = new Map()
    tickets.forEach((t) => {
      if (t.customerEmail && !map.has(t.customerEmail)) {
        map.set(t.customerEmail, t.customerEmail)
      }
    })
    return Array.from(map.values()).sort()
  }, [tickets])

  // Filtered + sorted
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = tickets.filter((t) => {
      const matchSearch = !q ||
        t.id.toLowerCase().includes(q) ||
        t.productName.toLowerCase().includes(q) ||
        (t.customerEmail || '').toLowerCase().includes(q)
      const matchStatus = statusFilters.length === 0 || statusFilters.includes(t.status)
      const matchCategory = categoryFilter === 'All' || t.category === categoryFilter
      const matchCustomer = customerFilter === 'All' || t.customerEmail === customerFilter
      let matchDate = true
      if (dateFrom) matchDate = matchDate && new Date(t.createdAt) >= new Date(dateFrom)
      if (dateTo) matchDate = matchDate && new Date(t.createdAt) <= new Date(dateTo + 'T23:59:59')
      return matchSearch && matchStatus && matchCategory && matchCustomer && matchDate
    })

    // Sort
    result.sort((a, b) => {
      let av, bv
      switch (sortKey) {
        case 'createdAt': av = a.createdAt; bv = b.createdAt; break
        case 'customer': av = (a.customerEmail || '').toLowerCase(); bv = (b.customerEmail || '').toLowerCase(); break
        case 'status': av = STATUS_LABEL[a.status] || ''; bv = STATUS_LABEL[b.status] || ''; break
        case 'price': av = a.tryOffer || 0; bv = b.tryOffer || 0; break
        default: av = a.createdAt; bv = b.createdAt
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [tickets, search, statusFilters, categoryFilter, customerFilter, dateFrom, dateTo, sortKey, sortDir])

  // Paginated
  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  // KPIs
  const kpis = useMemo(() => {
    const total = tickets.length
    const quoted = tickets.filter((t) => t.status === 'quoted').length
    const awaiting = tickets.filter((t) => t.status === 'awaiting_payment').length
    const shipped = tickets.filter((t) => t.status === 'shipped').length
    const revenue = tickets.reduce((s, t) => s + (t.tryOffer || 0), 0)
    return { total, quoted, awaiting, shipped, revenue }
  }, [tickets])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, statusFilters, categoryFilter, customerFilter, dateFrom, dateTo, pageSize])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const toggleStatusFilter = (key) => {
    setStatusFilters((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilters([])
    setCategoryFilter('All')
    setCustomerFilter('All')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = search || statusFilters.length > 0 || categoryFilter !== 'All' || customerFilter !== 'All' || dateFrom || dateTo

  // Selection
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set())
    else setSelected(new Set(paginated.map((t) => t.id)))
  }

  const handleBulkUpdate = () => {
    if (!bulkStatus || selected.size === 0) return
    bulkUpdateStatus(Array.from(selected), bulkStatus, user)
    toast(`${selected.size} talebin durumu güncellendi`, 'success')
    setSelected(new Set())
    setBulkStatus('')
  }

  // CSV export
  const exportCSV = () => {
    const headers = ['ID', 'Müşteri E-posta', 'Ürün Adı', 'Kategori', 'Durum', 'TR Tahmini', 'JPY Fiyat', 'TL Teklif', 'Takip Kodu', 'Oluşturma Tarihi']
    const rows = filtered.map((t) => [
      t.id, t.customerEmail, t.productName, t.category, STATUS_LABEL[t.status] || t.status,
      t.trEstimatePrice, t.jpyPrice || '', t.tryOffer || '', t.trackingCode || '', t.createdAt
    ])
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `talepler_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('CSV dışa aktarıldı', 'success')
  }

  // Drawer navigation
  const drawerTicket = drawerId ? tickets.find((t) => t.id === drawerId) : null
  const drawerIndex = drawerId ? filtered.findIndex((t) => t.id === drawerId) : -1

  const navigateDrawer = useCallback((dir) => {
    if (drawerIndex < 0) return
    const next = drawerIndex + dir
    if (next >= 0 && next < filtered.length) {
      setDrawerId(filtered[next].id)
    }
  }, [drawerIndex, filtered])

  // Keyboard nav in table
  const handleTableKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveRow((r) => Math.min(r + 1, paginated.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveRow((r) => Math.max(r - 1, 0))
    } else if (e.key === 'Enter' && activeRow >= 0 && activeRow < paginated.length) {
      setDrawerId(paginated[activeRow].id)
    }
  }

  return (
    <div className="space-y-4" ref={tableRef} onKeyDown={handleTableKey} tabIndex={0}>
      {/* KPI strip */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <KPI icon={Inbox} label="Toplam" value={kpis.total} accent="indigo2" />
        <KPI icon={Tag} label="Teklif Bekleyen" value={kpis.quoted} accent="gold" />
        <KPI icon={CreditCard} label="Ödeme Bekleyen" value={kpis.awaiting} accent="shu" />
        <KPI icon={Truck} label="Kargodaki" value={kpis.shipped} accent="matcha" />
        <KPI icon={Tag} label="Toplam Ciro" value={formatTRY(kpis.revenue)} accent="indigo2" wide />
      </div>

      {/* Toolbar */}
      <div className="glass rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ID, müşteri adı/e-posta, ürün adı ara..."
              aria-label="Taleplerde ara"
              className="input-base pl-9"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              hasActiveFilters ? 'bg-shu/15 text-shu' : 'glass text-muted hover:text-warm'
            }`}
          >
            <Filter size={15} /> Filtreler
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-shu" />}
          </button>

          {/* Density */}
          <div className="flex p-0.5 rounded-xl glass">
            <button
              onClick={() => setDensity('comfortable')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${density === 'comfortable' ? 'bg-surface2 text-warm' : 'text-faint'}`}
            >
              Rahat
            </button>
            <button
              onClick={() => setDensity('compact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${density === 'compact' ? 'bg-surface2 text-warm' : 'text-faint'}`}
            >
              Kompakt
            </button>
          </div>

          {/* CSV */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl glass text-muted hover:text-warm text-sm font-medium transition-colors"
          >
            <Download size={15} /> CSV
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-edge space-y-3">
                {/* Status chips */}
                <div>
                  <p className="text-xs text-faint mb-2">Durum</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => toggleStatusFilter(s.key)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          statusFilters.includes(s.key)
                            ? 'bg-shu/15 text-shu border-shu/30'
                            : 'glass text-faint border-edge hover:text-muted'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-faint mb-1.5">Kategori</p>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-base">
                      <option value="All">Tüm Kategoriler</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-faint mb-1.5">Müşteri</p>
                    <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="input-base">
                      <option value="All">Tüm Müşteriler</option>
                      {customers.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-faint mb-1.5">Başlangıç</p>
                      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-base" />
                    </div>
                    <div>
                      <p className="text-xs text-faint mb-1.5">Bitiş</p>
                      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-base" />
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-shu hover:text-shu-hover transition-colors inline-flex items-center gap-1">
                    <X size={12} /> Filtreleri temizle
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-edge">
            <span className="text-xs text-muted">{selected.size} talep seçili</span>
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="input-base py-1.5 text-xs w-auto">
              <option value="">Durum seç...</option>
              {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={!bulkStatus}
              className="px-3 py-1.5 rounded-lg bg-shu/15 text-shu text-xs font-medium hover:bg-shu/25 transition-colors disabled:opacity-40"
            >
              Uygula
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-faint hover:text-warm transition-colors">
              Temizle
            </button>
          </div>
        )}
      </div>

      {/* Table (desktop) */}
      <div className="hidden sm:block glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 glass-strong z-10">
              <tr className="border-b border-edge">
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="accent-shu"
                    aria-label="Tümünü seç"
                  />
                </th>
                <SortHeader label="Tarih / ID" sortKey="createdAt" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Müşteri" sortKey="customer" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Ürün" sortKey="productName" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Durum" sortKey="status" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Fiyat / Tahmin" sortKey="price" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                <th className="px-3 py-2.5 text-right text-xs font-medium text-faint">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16">
                    <EmptyState title="Talep bulunamadı" desc={hasActiveFilters ? 'Filtreleri temizleyip tekrar deneyin.' : 'Henüz talep yok.'} icon={Inbox} />
                  </td>
                </tr>
              ) : (
                paginated.map((t, i) => (
                  <tr
                    key={t.id}
                    onClick={() => setDrawerId(t.id)}
                    className={`border-b border-edge cursor-pointer transition-colors ${activeRow === i ? 'bg-shu/8' : 'hover:bg-surface2/50'} ${density === 'compact' ? 'h-11' : 'h-[48px]'}`}
                  >
                    <td className="px-3" onClick={(e) => { e.stopPropagation(); toggleSelect(t.id) }}>
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="accent-shu"
                        aria-label={`${t.id} seç`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-mono text-xs text-warm tnum">{t.id}</div>
                      <div className="text-[10px] text-faint tnum">{formatDate(t.createdAt)}</div>
                    </td>
                    <td className="px-3 py-2 max-w-[160px]">
                      <div className="font-medium text-warm truncate text-xs">{t.customerEmail?.split('@')[0] || '—'}</div>
                      <div className="text-[10px] text-faint truncate">{t.customerEmail || '—'}</div>
                    </td>
                    <td className="px-3 py-2 max-w-[180px]">
                      <div className="text-warm truncate text-xs" title={t.productName}>{t.productName}</div>
                      <div className="text-[10px] text-faint">{t.category}</div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {t.tryOffer ? (
                        <span className="font-mono text-xs font-semibold text-matcha tnum">{formatTRY(t.tryOffer)}</span>
                      ) : (
                        <span className="font-mono text-xs text-faint tnum">tahmini {formatTRY(t.trEstimatePrice)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setDrawerId(t.id)}
                          className="text-xs px-2.5 py-1 rounded-lg glass text-warm hover:border-shu/30 transition-colors"
                        >
                          Detay
                        </button>
                        <select
                          value={t.status}
                          onChange={(e) => { updateStatus(t.id, e.target.value, '', user, 'admin'); toast('Durum güncellendi', 'success') }}
                          className="text-[10px] bg-surface2 border border-edge rounded-lg px-1.5 py-1 text-warm cursor-pointer"
                          aria-label="Hızlı durum değiştir"
                        >
                          {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-edge">
          <div className="flex items-center gap-2 text-xs text-faint">
            <span>{filtered.length} kayıttan</span>
            <span className="text-warm font-medium">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)}</span>
            <span>gösteriliyor</span>
          </div>
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="text-xs bg-surface2 border border-edge rounded-lg px-2 py-1 text-warm cursor-pointer">
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}/sayfa</option>)}
            </select>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-faint hover:text-warm transition-colors disabled:opacity-30" aria-label="Önceki sayfa">
                <ChevronUp size={14} className="rotate-[-90deg]" />
              </button>
              <span className="text-xs text-muted tnum px-1">{currentPage}/{totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-faint hover:text-warm transition-colors disabled:opacity-30" aria-label="Sonraki sayfa">
                <ChevronDown size={14} className="rotate-[-90deg]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {paginated.length === 0 ? (
          <EmptyState title="Talep bulunamadı" desc={hasActiveFilters ? 'Filtreleri temizleyip tekrar deneyin.' : 'Henüz talep yok.'} icon={Inbox} />
        ) : (
          paginated.map((t) => (
            <div key={t.id} onClick={() => setDrawerId(t.id)} className="glass rounded-xl p-3 active:bg-surface2/50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0">
                  <span className="font-mono text-xs text-warm tnum">{t.id}</span>
                  <p className="text-sm font-medium text-warm truncate">{t.productName}</p>
                  <p className="text-[11px] text-faint truncate">{t.customerEmail}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-faint tnum">{formatDate(t.createdAt)}</span>
                {t.tryOffer ? (
                  <span className="font-mono font-semibold text-matcha tnum">{formatTRY(t.tryOffer)}</span>
                ) : (
                  <span className="font-mono text-faint tnum">~{formatTRY(t.trEstimatePrice)}</span>
                )}
              </div>
            </div>
          ))
        )}
        {/* Mobile pagination */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="px-3 py-1.5 rounded-lg glass text-sm text-warm disabled:opacity-30">Önceki</button>
          <span className="text-xs text-muted tnum">{currentPage}/{totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 rounded-lg glass text-sm text-warm disabled:opacity-30">Sonraki</button>
        </div>
      </div>

      {/* Drawer */}
      <AdminTicketDrawer
        ticket={drawerTicket}
        tickets={tickets}
        onClose={() => setDrawerId(null)}
        onNavigate={navigateDrawer}
        onUpdateStatus={(id, status, note, _session, actor) => updateStatus(id, status, note, user, actor)}
        onSendOffer={(id, data) => sendOffer(id, data, user)}
        onSetTracking={(id, code) => setTrackingCode(id, code, user)}
        onSetInternalNote={(id, note) => setInternalNote(id, note, user)}
        onToast={toast}
      />

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}

function SortHeader({ label, sortKey, current, dir, onSort, align = 'left' }) {
  const active = sortKey === current
  return (
    <th className={`px-3 py-2.5 text-xs font-medium text-faint ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-warm transition-colors ${active ? 'text-warm' : ''}`}
      >
        {label}
        {active ? (dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronsUpDown size={12} className="opacity-40" />}
      </button>
    </th>
  )
}

function KPI({ icon: Icon, label, value, accent, wide }) {
  const colorMap = {
    indigo2: 'text-indigo2',
    shu: 'text-shu',
    gold: 'text-gold',
    matcha: 'text-matcha',
  }
  return (
    <div className={`glass rounded-xl px-3 py-2 flex items-center gap-2 ${wide ? 'flex-1 min-w-[140px]' : ''}`}>
      <Icon size={15} className={colorMap[accent]} />
      <div className="leading-tight">
        <p className="text-[10px] text-faint">{label}</p>
        <p className={`text-sm font-display font-bold tnum ${colorMap[accent]}`}>{value}</p>
      </div>
    </div>
  )
}
