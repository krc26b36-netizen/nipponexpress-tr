import SkipLink from '../components/SkipLink.jsx'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Plus, LayoutGrid, Sun, Moon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme.js'
import MobileNav from '../components/MobileNav.jsx'
import Footer from '../components/Footer.jsx'

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { to: '/panel', label: 'Taleplerim', icon: LayoutGrid },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <div className="app-bg" />
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-edge">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/panel" className="flex items-center gap-3 min-w-0">
            <div className="hanko shrink-0" aria-hidden="true">日</div>
            <div className="min-w-0">
              <h1 className="font-display font-extrabold text-base sm:text-lg leading-tight text-warm truncate">
                NipponExpress <span className="text-shu">TR</span>
              </h1>
              <p className="text-[11px] text-faint font-jp leading-none hidden sm:block">Müşteri Paneli</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-warm transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Desktop tabs */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl glass">
              {tabs.map((t) => {
                const active = location.pathname === t.to || (t.to === '/panel' && location.pathname.startsWith('/panel'))
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      active ? 'bg-indigo2/20 text-indigo2' : 'text-faint hover:text-muted'
                    }`}
                  >
                    <t.icon size={14} /> {t.label}
                  </Link>
                )
              })}
            </div>

            <Link
              to="/panel/yeni"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-shu to-shu-grad text-white text-sm font-semibold hover:brightness-110 transition shadow-shu-glow"
            >
              <Plus size={16} /> Yeni Talep
            </Link>

            <div className="flex items-center gap-2 pl-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shu to-shu-grad flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-sm font-medium text-warm truncate max-w-[120px]">{user.name}</p>
                <p className="text-[11px] text-faint truncate max-w-[120px]">{user.email}</p>
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
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 pb-24 sm:pb-8">
        <Outlet />
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
