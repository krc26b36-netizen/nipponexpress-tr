import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useTickets } from '../hooks/useTickets.js'
import { useToast } from '../hooks/useToast.js'
import NewTicketForm from '../components/NewTicketForm.jsx'
import Toast from '../components/Toast.jsx'

export default function NewTicket() {
  const { user } = useAuth()
  const { addTicket } = useTickets()
  const { toasts, toast, dismiss } = useToast()
  const navigate = useNavigate()

  const handleNew = (data) => {
    addTicket(data, user)
    toast('Talebiniz oluşturuldu', 'success')
    navigate('/panel')
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h2 className="font-display font-bold text-xl text-warm">Yeni Talep Oluştur</h2>
      <NewTicketForm
        onSubmit={handleNew}
        onClose={() => navigate('/panel')}
        onToast={toast}
        embedded
      />
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
