import { useState } from 'react'
import { Copy, Check, Terminal, BrainCircuit } from 'lucide-react'
import { SYSTEM_PROMPT, WORKER_CODE } from '../data/aiPrompts.js'

export default function AiPromptPanel({ onToast }) {
  const [tab, setTab] = useState('system')
  const [copied, setCopied] = useState(null)

  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      onToast('Panoya kopyalandı', 'success')
      setTimeout(() => setCopied(null), 1800)
    } catch (e) {
      onToast('Kopyalama başarısız', 'error')
    }
  }

  const content = tab === 'system' ? SYSTEM_PROMPT : WORKER_CODE

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-edge">
        <div className="flex">
          <TabBtn active={tab === 'system'} onClick={() => setTab('system')} icon={BrainCircuit}>
            Sistem Promptu
          </TabBtn>
          <TabBtn active={tab === 'worker'} onClick={() => setTab('worker')} icon={Terminal}>
            Worker Kodu
          </TabBtn>
        </div>
        <button
          onClick={() => copy(tab, content)}
          className="mr-3 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-shu/15 text-shu hover:bg-shu/25 transition-colors"
        >
          {copied === tab ? <Check size={13} /> : <Copy size={13} />}
          {copied === tab ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>
      <pre className="p-4 sm:p-5 text-xs leading-relaxed overflow-x-auto font-mono text-muted max-h-[60vh]">
        <code>{content}</code>
      </pre>
    </div>
  )
}

function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
        active
          ? 'text-warm border-shu'
          : 'text-faint border-transparent hover:text-muted'
      }`}
    >
      <Icon size={15} /> {children}
    </button>
  )
}
