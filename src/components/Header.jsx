import { Link } from 'react-router-dom'
import { Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../hooks/useAuth.js'

// Landing/Auth sayfalarında kullanılan header — giriş yapılmamışken
export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-edge">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="hanko shrink-0" aria-hidden="true">日</div>
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-base sm:text-lg leading-tight text-warm truncate">
              NipponExpress <span className="text-shu">TR</span>
            </h1>
            <p className="text-[11px] text-faint font-jp leading-none hidden sm:block">
              日本からトルコへ · Proxy Shopping
            </p>
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

          {user ? (
            <>
              <div className="flex items-center gap-2 pl-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shu to-shu-grad flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block leading-tight">
                  <p className="text-sm font-medium text-warm truncate max-w-[140px]">{user.name}</p>
                  <p className="text-[11px] text-faint truncate max-w-[140px]">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                aria-label="Çıkış yap"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted hover:text-shu transition-colors"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              to="/giris"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-shu to-shu-grad text-white text-sm font-semibold hover:brightness-110 transition shadow-shu-glow"
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
