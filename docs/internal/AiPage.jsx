import { useToast } from '../hooks/useToast.js'
import AiPromptPanel from '../components/AiPromptPanel.jsx'
import Toast from '../components/Toast.jsx'

export default function AiPage() {
  const { toasts, toast, dismiss } = useToast()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl text-warm">Cloudflare AI Prompt</h2>
        <p className="text-sm text-muted mt-1">Sistem promptu ve Worker kodu — kopyalayıp Cloudflare AI Gateway / Workers üzerinde kullanabilirsiniz.</p>
      </div>
      <AiPromptPanel onToast={toast} />
      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
