import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, Plus, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../hooks/useAuth.js'

// Müşteri paneli mobil alt bar
export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()

  const items = [
    { key: '/panel', icon: LayoutGrid, label: 'Talepler', to: '/panel' },
    { key: '/panel/yeni', icon: Plus, label: 'Yeni', to: '/panel/yeni', action: true },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-edge">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((it) => {
          if (it.action) {
            return (
              <button
                key={it.key}
                onClick={() => navigate(it.to)}
                aria-label="Yeni talep oluştur"
                className="w-12 h-12 -mt-4 rounded-2xl bg-gradient-to-r from-shu to-shu-grad text-white flex items-center justify-center shadow-shu-glow"
              >
                <it.icon size={22} />
              </button>
            )
          }
          const active = location.pathname === it.to || (it.to === '/panel' && location.pathname.startsWith('/panel') && !location.pathname.includes('/yeni'))
          return (
            <Link
              key={it.key}
              to={it.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? 'text-shu' : 'text-faint'
              }`}
            >
              <it.icon size={20} />
              <span className="text-[10px] font-medium">{it.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => { logout(); navigate('/giris') }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-faint hover:text-shu transition-colors"
          aria-label="Çıkış yap"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Çıkış</span>
        </button>
      </div>
    </nav>
  )
}
