import { useState, useEffect, useCallback } from 'react'
import { storageGet, storageSet, STORAGE_KEYS } from '../lib/storage.js'
import { getSeedTickets } from '../data/mockData.js'
import { getAllUsers } from '../lib/userStore.js'
import { calcTryOffer } from '../lib/pricing.js'
import { STATUS_NOTE, STATUS_KEYS, CATEGORIES } from '../data/constants.js'
import { safeImageUrl } from '../lib/url.js'

// Not: Bu kontroller istemci tarafındadır ve yalnızca arayüz hatalarını önler.
// Gerçek yetkilendirme sunucuda yapılmalıdır (kullanıcı localStorage'ı doğrudan değiştirebilir).
const MAX = { productName: 160, phone: 30, address: 500, notes: 1000, trackingCode: 64, internalNote: 2000, note: 500 }
const clip = (v, n) => String(v ?? '').trim().slice(0, n)
const isAdmin = (session) => !!session && session.role === 'admin'
const isOwner = (t, session) => !!session && t.ownerId === session.id
const canAct = (t, session) => isAdmin(session) || isOwner(t, session)

function loadTickets() {
  const stored = storageGet(STORAGE_KEYS.TICKETS, null)
  if (stored && Array.isArray(stored) && stored.length > 0) return stored
  // Seed: kullanıcıları bul, ownerId ata
  const users = getAllUsers()
  const seed = getSeedTickets(users)
  storageSet(STORAGE_KEYS.TICKETS, seed)
  return seed
}

function nextId(tickets) {
  const max = tickets.reduce((m, t) => {
    const n = parseInt(String(t.id).replace(/\D/g, ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 1000)
  return `JP-TR-${max + 1}`
}

export function useTickets() {
  const [tickets, setTickets] = useState(loadTickets)

  useEffect(() => {
    storageSet(STORAGE_KEYS.TICKETS, tickets)
  }, [tickets])

  // Veri izolasyonu: müşteri sadece kendi talepleri, admin tümü
  const getVisibleTickets = useCallback((session) => {
    if (!session) return []
    if (session.role === 'admin') return tickets
    return tickets.filter((t) => t.ownerId === session.id)
  }, [tickets])

  // Tek bir talebi getir (erişim kontrolü ile)
  const getTicket = useCallback((id, session) => {
    const ticket = tickets.find((t) => t.id === id)
    if (!ticket) return null
    if (!session || (session.role !== 'admin' && ticket.ownerId !== session.id)) return null
    return ticket
  }, [tickets])

  const addTicket = useCallback((data, session) => {
    if (!session) return null
    const now = new Date().toISOString()
    const id = nextId(tickets)
    const price = Number(data.trEstimatePrice)
    const ticket = {
      id,
      productName: clip(data.productName, MAX.productName),
      category: CATEGORIES.includes(data.category) ? data.category : CATEGORIES[0],
      trEstimatePrice: Number.isFinite(price) && price > 0 ? Math.min(price, 100_000_000) : 0,
      imageUrl: safeImageUrl(data.imageUrl),
      phone: clip(data.phone, MAX.phone),
      address: clip(data.address, MAX.address),
      notes: clip(data.notes, MAX.notes),
      ownerId: session.id,
      customerEmail: session.email,
      status: 'received',
      jpyPrice: null,
      kargoJPY: 0,
      marginPct: 25,
      tryOffer: null,
      trackingCode: '',
      internalNote: '',
      createdAt: now,
      updatedAt: now,
      timeline: [{ status: 'received', at: now, note: 'Talebiniz alındı.', actor: 'customer' }],
    }
    setTickets((prev) => [ticket, ...prev])
    return ticket
  }, [tickets])

  // Sahiplik kontrolü ile durum güncelleme
  const updateStatus = useCallback((id, newStatus, note = '', session, actor = 'admin') => {
    if (!isAdmin(session) || !STATUS_KEYS.includes(newStatus)) return
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const now = new Date().toISOString()
        return {
          ...t,
          status: newStatus,
          updatedAt: now,
          timeline: [...t.timeline, { status: newStatus, at: now, note: clip(note, MAX.note) || STATUS_NOTE[newStatus] || '', actor: 'admin' }],
        }
      })
    )
  }, [])

  // Admin: teklif gönder (JPY + kargo + marj → TL)
  const sendOffer = useCallback((id, { jpyPrice, kargoJPY, marginPct }, session) => {
    if (!isAdmin(session)) return
    const jpy = Number(jpyPrice)
    const kargo = Number(kargoJPY) || 0
    const margin = Number(marginPct)
    if (!Number.isFinite(jpy) || jpy <= 0 || jpy > 1_000_000_000) return
    if (!Number.isFinite(kargo) || kargo < 0 || kargo > 1_000_000_000) return
    if (!Number.isFinite(margin) || margin < 0 || margin > 300) return
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const now = new Date().toISOString()
        const offer = calcTryOffer(jpy, kargo, margin)
        return {
          ...t,
          jpyPrice: jpy,
          kargoJPY: kargo,
          marginPct: margin,
          tryOffer: offer,
          status: 'quoted',
          updatedAt: now,
          timeline: [...t.timeline, { status: 'quoted', at: now, note: `Fiyat teklifi gönderildi: ${offer ? offer.toLocaleString('tr-TR') + ' ₺' : '—'}`, actor: 'admin' }],
        }
      })
    )
  }, [])

  // Müşteri: teklifi kabul et
  const acceptOffer = useCallback((id, session) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        if (!canAct(t, session) || t.status !== 'quoted') return t
        const now = new Date().toISOString()
        return {
          ...t,
          status: 'awaiting_payment',
          updatedAt: now,
          timeline: [...t.timeline, { status: 'awaiting_payment', at: now, note: 'Teklif kabul edildi. Ödeme bekleniyor.', actor: 'customer' }],
        }
      })
    )
  }, [])

  // Müşteri: teklifi reddet (not ile "Talep Alındı"ya dön)
  const rejectOffer = useCallback((id, note, session) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        if (!canAct(t, session) || t.status !== 'quoted') return t
        const now = new Date().toISOString()
        return {
          ...t,
          status: 'received',
          updatedAt: now,
          timeline: [...t.timeline, { status: 'received', at: now, note: `Teklif reddedildi: ${clip(note, MAX.note) || 'Müşteri teklifi kabul etmedi.'}`, actor: 'customer' }],
        }
      })
    )
  }, [])

  // Müşteri: talebi iptal et (yalnızca "received" aşamasında)
  const cancelTicket = useCallback((id, session) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        if (!canAct(t, session) || t.status !== 'received') return t
        const now = new Date().toISOString()
        return {
          ...t,
          status: 'cancelled',
          updatedAt: now,
          timeline: [...t.timeline, { status: 'cancelled', at: now, note: 'Talep müşteri tarafından iptal edildi.', actor: 'customer' }],
        }
      })
    )
  }, [])

  // Admin: takip kodu güncelle
  const setTrackingCode = useCallback((id, code, session) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        if (!isAdmin(session)) return t
        const now = new Date().toISOString()
        return { ...t, trackingCode: clip(code, MAX.trackingCode), updatedAt: now }
      })
    )
  }, [])

  // Admin: iç not güncelle
  const setInternalNote = useCallback((id, note, session) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        if (!isAdmin(session)) return t
        return { ...t, internalNote: clip(note, MAX.internalNote), updatedAt: new Date().toISOString() }
      })
    )
  }, [])

  // Toplu durum güncelleme (admin)
  const bulkUpdateStatus = useCallback((ids, newStatus, session) => {
    if (!isAdmin(session) || !STATUS_KEYS.includes(newStatus)) return
    const now = new Date().toISOString()
    setTickets((prev) =>
      prev.map((t) => {
        if (!ids.includes(t.id)) return t
        return {
          ...t,
          status: newStatus,
          updatedAt: now,
          timeline: [...t.timeline, { status: newStatus, at: now, note: STATUS_NOTE[newStatus] || 'Toplu güncelleme.', actor: 'admin' }],
        }
      })
    )
  }, [])

  return {
    tickets,
    getVisibleTickets,
    getTicket,
    addTicket,
    updateStatus,
    sendOffer,
    acceptOffer,
    rejectOffer,
    cancelTicket,
    setTrackingCode,
    setInternalNote,
    bulkUpdateStatus,
  }
}
