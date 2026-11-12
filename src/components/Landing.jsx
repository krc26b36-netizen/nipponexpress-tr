import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Package, Search, CreditCard, Truck, PackageCheck, ShieldCheck } from 'lucide-react'
import { STATUSES } from '../data/constants.js'

const steps = [
  { icon: Package, title: 'Talep Oluştur', desc: 'İstediğiniz ürünü, kategoriyi ve teslimat adresini girin.' },
  { icon: Search, title: 'Japonya Arama', desc: 'Ekibimiz Yodobashi, Bic Camera, Don Quijote gibi tedarikçilerde arar.' },
  { icon: CreditCard, title: 'Teklif & Ödeme', desc: 'JPY/TRY teklifi sunulur, onaylayıp ödemeyi yapın.' },
  { icon: Truck, title: 'Kargo', desc: 'Tokyo’dan İstanbul’a güvenli kargo, takip koduyla.' },
  { icon: PackageCheck, title: 'Teslim', desc: 'Kapınızda. Yeni talepler için hazırız.' },
]

export default function Landing() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="hanko mx-auto mb-5 animate-floaty" aria-hidden="true">日</div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-warm leading-tight">
          Japonya’dan Türkiye’ye
          <br />
          <span className="bg-gradient-to-r from-shu to-shu-grad bg-clip-text text-transparent">
            özel tedarik portalı
          </span>
        </h1>
        <p className="mt-4 text-muted text-sm sm:text-base max-w-xl mx-auto">
          Elektronikten anime koleksiyonuna, kozmetikten gıdaya — Tokyo’dan kapınıza.
          Talebinizi oluşturun, Japonya ekibimiz tedarik etsin.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/giris"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-shu to-shu-grad text-white font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition shadow-shu-glow"
          >
            Hemen Başla <ArrowRight size={18} />
          </Link>
          <Link
            to="/giris"
            className="w-full sm:w-auto px-6 py-3 rounded-xl glass text-warm font-semibold hover:border-shu/30 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-faint inline-flex items-center gap-1.5">
          <ShieldCheck size={13} /> Demo — veriler tarayıcınızda saklanır, sunucuya gönderilmez.
        </p>
      </motion.div>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="glass rounded-2xl p-5 text-center hover:border-shu/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-shu/12 text-shu flex items-center justify-center mx-auto mb-3">
              <s.icon size={22} />
            </div>
            <p className="font-mono text-[10px] text-faint mb-1">ADIM {i + 1}</p>
            <h3 className="font-display font-semibold text-warm text-sm mb-1">{s.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-2"
      >
        {STATUSES.map((s, i) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-full glass text-muted">{s.label}</span>
            {i < STATUSES.length - 1 && <ArrowRight size={12} className="text-faint" />}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
