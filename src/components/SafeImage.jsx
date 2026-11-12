import { useState } from 'react'
import { Package } from 'lucide-react'
import { safeImageUrl } from '../lib/url.js'

// Kullanıcı kaynaklı görsel URL'si için güvenli görüntüleyici.
// - Yalnızca https URL'leri yüklenir.
// - referrerPolicy="no-referrer": görsel sunucusuna sayfa adresi sızmaz.
// - Boş src hiç istek atmaz; yüklenemezse yer tutucu gösterilir.
export default function SafeImage({ src, alt, className = '', iconSize = 32, label = 'Görsel yok', ...rest }) {
  const url = safeImageUrl(src)
  const [failed, setFailed] = useState(false)

  if (!url || failed) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} — ${label}` : label}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-faint seigaiha"
      >
        <Package size={iconSize} aria-hidden="true" />
        <span className="text-xs">{label}</span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}
