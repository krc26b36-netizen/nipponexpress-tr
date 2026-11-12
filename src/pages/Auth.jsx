import SkipLink from '../components/SkipLink.jsx'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Shield, X, AlertCircle,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { DEMO_ACCOUNTS_ENABLED, LIMITS } from '../lib/userStore.js'
import { useTheme } from '../hooks/useTheme.js'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function Auth() {
  const { login, register } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // login | register
  const [adminMode, setAdminMode] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)

  const emailRef = useRef(null)
  const nameRef = useRef(null)
  const passwordRef = useRef(null)
  const errorRef = useRef(null)

  // Lockout countdown
  useEffect(() => {
    if (lockoutUntil <= 0) return
    const tick = () => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
      setLockoutRemaining(remaining)
      if (remaining <= 0) {
        setLockoutUntil(0)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockoutUntil])

  // Focus first field on mode change
  useEffect(() => {
    setError('')
    setFieldErrors({})
    setTimeout(() => {
      if (mode === 'register' && nameRef.current) nameRef.current.focus()
      else if (emailRef.current) emailRef.current.focus()
    }, 50)
  }, [mode, adminMode])

  function validate() {
    const errs = {}
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = 'Lütfen geçerli bir e-posta girin.'
    if (mode === 'register') {
      if (!name.trim()) errs.name = 'Ad soyad zorunludur.'
      if (!password || password.length < LIMITS.passwordMin) errs.password = `Şifre en az ${LIMITS.passwordMin} karakter olmalı.`
      else if (password.length > LIMITS.passwordMax) errs.password = `Şifre en fazla ${LIMITS.passwordMax} karakter olabilir.`
      else if (!/\d/.test(password)) errs.password = 'Şifre en az 1 rakam içermeli.'
      else if (!/[a-zA-Z]/.test(password)) errs.password = 'Şifre en az 1 harf içermeli.'
      if (password !== password2) errs.password2 = 'Şifre tekrarı eşleşmiyor.'
    }
    if (mode === 'login' && !password) errs.password = 'Şifre zorunludur.'
    return errs
  }

  async function submit(e) {
    e.preventDefault()
    if (lockoutRemaining > 0) return

    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length) {
      // Focus first error field
      if (errs.name && nameRef.current) nameRef.current.focus()
      else if (errs.email && emailRef.current) emailRef.current.focus()
      else if ((errs.password || errs.password2) && passwordRef.current) passwordRef.current.focus()
      return
    }

    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const u = await login(email.trim(), password, adminMode)
        navigate(u.role === 'admin' ? '/admin' : '/panel', { replace: true })
      } else {
        const u = await register({ name: name.trim(), email: email.trim(), password })
        navigate('/panel', { replace: true })
      }
    } catch (err) {
      if (err.code === 'LOCKED' && err.retryAfterMs) {
        setError('')
        setLockoutUntil(Date.now() + err.retryAfterMs)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const isLocked = lockoutRemaining > 0

  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <div className="app-bg" />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm relative">
          {/* Admin button — top right */}
          <button
            onClick={() => { setAdminMode(!adminMode); setMode('login'); setError(''); setFieldErrors({}) }}
            className={`absolute -top-2 right-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              adminMode
                ? 'bg-gold/15 text-gold border-gold/40'
                : 'glass text-faint border-gold/30 hover:text-gold hover:border-gold/50'
            }`}
          >
            <Shield size={13} /> {adminMode ? 'Admin Modu' : 'Admin Girişi'}
          </button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="glass-strong rounded-3xl p-6 mt-10"
          >
            {/* Admin gold strip */}
            {adminMode && (
              <div className="absolute left-0 right-0 -top-px h-1 rounded-t-3xl bg-gradient-to-r from-gold/0 via-gold to-gold/0" />
            )}

            <div className="text-center mb-6">
              <div className="hanko mx-auto mb-3" aria-hidden="true">日</div>
              <h2 className="font-display font-bold text-xl text-warm">
                {adminMode ? 'Japonya Ekibi Girişi' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </h2>
              <p className="text-xs text-faint mt-1">
                {adminMode ? 'Yönetici hesabıyla giriş yapın' : 'NipponExpress TR portalına erişin'}
              </p>
            </div>

            {/* Tabs */}
            {!adminMode && (
              <div className="flex p-1 rounded-xl glass mb-5">
                <TabBtn active={mode === 'login'} onClick={() => setMode('login')} icon={LogIn}>Giriş Yap</TabBtn>
                <TabBtn active={mode === 'register'} onClick={() => setMode('register')} icon={UserPlus}>Kayıt Ol</TabBtn>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              {mode === 'register' && !adminMode && (
                <FormField id="auth-name" label="Ad Soyad" icon={User} error={fieldErrors.name}>
                  <input
                    id="auth-name"
                    ref={nameRef}
                    maxLength={LIMITS.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="input-base"
                    autoComplete="name"
                  />
                </FormField>
              )}
              <FormField id="auth-email" label="E-posta" icon={Mail} error={fieldErrors.email}>
                <input
                  id="auth-email"
                  ref={emailRef}
                  maxLength={LIMITS.email}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="input-base"
                  autoComplete="email"
                />
              </FormField>
              <FormField id="auth-password" label="Şifre" icon={Lock} error={fieldErrors.password}>
                <div className="relative">
                  <input
                    id="auth-password"
                    ref={passwordRef}
                    maxLength={LIMITS.passwordMax}
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'En az 8 karakter, 1 rakam, 1 harf' : '••••••••'}
                    className="input-base pr-10"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-faint hover:text-warm transition-colors"
                    aria-label={showPwd ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>
              {mode === 'register' && !adminMode && (
                <FormField id="auth-password2" label="Şifre Tekrar" icon={Lock} error={fieldErrors.password2}>
                  <div className="relative">
                    <input
                      id="auth-password2"
                      maxLength={LIMITS.passwordMax}
                      type={showPwd2 ? 'text' : 'password'}
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="••••••••"
                      className="input-base pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd2(!showPwd2)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-faint hover:text-warm transition-colors"
                      aria-label={showPwd2 ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormField>
              )}

              {/* Error / lockout */}
              <AnimatePresence>
                {(error || isLocked) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div role="alert" className="flex items-start gap-2 text-xs text-shu bg-shu/10 rounded-lg px-3 py-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span ref={errorRef}>{isLocked ? `Çok fazla hatalı deneme. ${lockoutRemaining} sn bekleyin.` : error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || isLocked}
                className={`w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  adminMode
                    ? 'bg-gradient-to-r from-gold to-gold/70 hover:brightness-110'
                    : 'bg-gradient-to-r from-shu to-shu-grad hover:brightness-110 shadow-shu-glow'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : mode === 'login' ? (
                  <><LogIn size={16} /> Giriş Yap</>
                ) : (
                  <><UserPlus size={16} /> Kayıt Ol</>
                )}
              </button>
            </form>

            {!adminMode && (
              <p className="text-center text-xs text-faint mt-4">
                {mode === 'login' ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setFieldErrors({}) }}
                  className="text-shu hover:text-shu-hover font-medium transition-colors"
                >
                  {mode === 'login' ? 'Kayıt ol' : 'Giriş yap'}
                </button>
              </p>
            )}

            <p className="text-center text-[10px] text-faint mt-3">
              Önizleme sürümü — veriler yalnızca bu tarayıcıda saklanır.
            </p>
          </motion.div>

          {/* Demo hesap ipucu — yalnızca geliştirme/demo modunda görünür */}
          {DEMO_ACCOUNTS_ENABLED && (
            <div className="mt-4 glass rounded-xl p-3 text-[11px] text-faint space-y-1">
              <p className="font-medium text-muted">Demo Hesaplar (yalnızca geliştirme modu):</p>
              <p>ahmet@example.com / Demo1234!</p>
              <p>zeynep@example.com / Demo1234!</p>
              <p>admin@nipponexpress.tr / Admin123! (Admin Girişi)</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
        active ? 'bg-shu/15 text-shu' : 'text-faint hover:text-muted'
      }`}
    >
      <Icon size={15} /> {children}
    </button>
  )
}

function FormField({ id, label, icon: Icon, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs text-muted mb-1.5 flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </label>
      {children}
      {error && <p role="alert" className="text-xs text-shu mt-1">{error}</p>}
    </div>
  )
}
