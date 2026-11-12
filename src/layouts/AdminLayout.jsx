import SkipLink from '../components/SkipLink.jsx'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, Menu, X, Sun, Moon, ChevronLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme.js'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { to: '/admin', label: 'Talep Tablosu', icon: '📋' },
  ]

  return (
    <div className="min-h-screen flex">
      <SkipLink />
      <div className="app-bg" />

      {/* Sidebar */}
      <aside className={`hidden sm:flex flex-col border-r border-edge glass-strong transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-edge">
          <Link to="/admin" className="flex items-center gap-2 min-w-0">
            <div className="hanko shrink-0" aria-hidden="true">日</div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-display font-bold text-sm text-warm truncate">NipponExpress</p>
                <p className="text-[10px] text-gold font-jp leading-none">Admin Paneli</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-gold/15 text-gold' : 'text-faint hover:text-warm hover:bg-surface2'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-edge">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-faint hover:text-warm hover:bg-surface2 transition-colors text-xs"
          >
            {collapsed ? <ChevronLeft size={16} className="rotate-180" /> : <><ChevronLeft size={16} /> Daralt</>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 glass-strong border-b border-edge h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="sm:hidden flex items-center gap-2">
              <div className="hanko shrink-0" aria-hidden="true">日</div>
            </Link>
            <div>
              <h1 className="font-display font-bold text-sm sm:text-base text-warm">Admin Paneli</h1>
              <p className="text-[11px] text-faint hidden sm:block">Tüm talepler — istisnasız</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-warm transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center gap-2 pl-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-sm font-medium text-warm truncate max-w-[120px]">{user.name}</p>
                <p className="text-[11px] text-gold truncate max-w-[120px]">Admin</p>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate('/giris') }}
              aria-label="Çıkış yap"
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-shu transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
