import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useTickets } from '../hooks/useTickets.js'
import { useToast } from '../hooks/useToast.js'
import CustomerTicketDetail from '../components/CustomerTicketDetail.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Toast from '../components/Toast.jsx'
import { ShieldAlert } from 'lucide-react'

export default function CustomerTicket() {
  const { id } = useParams()
  const { user } = useAuth()
  const { getTicket, acceptOffer, rejectOffer, cancelTicket } = useTickets()
  const { toasts, toast, dismiss } = useToast()
  const navigate = useNavigate()

  const ticket = getTicket(id, user)

  if (!ticket) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Talep bulunamadı"
          desc="Bu talep mevcut değil veya erişim yetkiniz yok."
          icon={ShieldAlert}
          action={
            <button
              onClick={() => navigate('/panel')}
              className="mt-4 px-5 py-2.5 rounded-xl glass text-warm text-sm font-medium hover:border-shu/30 transition-colors"
            >
              Taleplere dön
            </button>
          }
        />
        <Toast toasts={toasts} onDismiss={dismiss} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CustomerTicketDetail
        ticket={ticket}
        onAcceptOffer={acceptOffer}
        onRejectOffer={rejectOffer}
        onCancel={cancelTicket}
        onToast={toast}
      />
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
