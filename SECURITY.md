# Güvenlik notları — NipponExpress TR

## En önemli gerçek

Bu proje şu an **yalnızca tarayıcıda çalışan bir önizleme (prototip)**. Kullanıcılar, şifre özetleri, oturumlar ve talepler
her ziyaretçinin kendi tarayıcısındaki `localStorage` içinde durur. Bunun iki sonucu var:

1. Herhangi bir ziyaretçi geliştirici araçlarını açıp `role` alanını `admin` yapabilir. İstemci tarafındaki hiçbir
   yetki kontrolü bunu **engelleyemez**. Aşağıdaki düzeltmeler hataları ve kolay saldırıları kapatır, ama gerçek güvenlik değildir.
2. Bir müşterinin oluşturduğu talep başka bir cihazdaki admin panelinde **görünmez**; veri paylaşılmaz.

Canlıda gerçek müşteri verisi (telefon, adres) toplamadan önce sunucu tarafı gerekir:
Cloudflare Workers + D1 (sunucuda kimlik doğrulama, HttpOnly çerez oturumu, sunucuda rol ve sahiplik kontrolü).
`src/lib/auth.js` bu geçiş için arayüz olarak ayrılmıştır; yalnızca içi API çağrılarıyla değiştirilecektir.

## Bu sürümde düzeltilenler

| # | Sorun | Düzeltme |
|---|-------|----------|
| 1 | Giriş sayfasında **admin şifresi dahil demo hesaplar herkese açık** görünüyordu | Yalnızca `npm run dev` veya `VITE_ENABLE_DEMO_ACCOUNTS=true` iken oluşur ve gösterilir. Üretimde varsayılan olarak kapalı. |
| 2 | Şifreler tek tur SHA-256 ile saklanıyordu | PBKDF2-SHA256 (310.000 tur) + sabit zamanlı karşılaştırma. Eski hesaplar ilk girişte otomatik yükseltilir. |
| 3 | Kaba kuvvet koruması yalnızca ekrandaydı (sayfa yenileyince sıfırlanıyordu) | E-posta başına kalıcı kilit: 5 hatalı denemede 30 sn, tekrarında ikiye katlanır (en fazla 15 dk). |
| 4 | Hata mesajı hesabın var olup olmadığını söylüyordu | Her iki durumda aynı mesaj; hesap yokken de aynı hash süresi harcanır. |
| 5 | Admin işlemlerinde oturum `null` gönderilince yetki kontrolü **atlanıyordu** | Tüm kontroller varsayılan-reddet. Admin paneli oturumu açıkça iletir. |
| 6 | Müşteri, başkasının teklifini kabul/red ve her aşamada iptal edebiliyordu | Yalnızca sahibi/admin; kabul/red yalnızca "teklif verildi", iptal yalnızca "talep alındı" aşamasında. |
| 7 | CSV dışa aktarımında formül enjeksiyonu (`=HYPERLINK(...)`) | `= + - @` ile başlayan metinler düz metne çevrilir. |
| 8 | Görsel URL'si herhangi bir şema olabilirdi; boş `src` istek atıyordu; admin IP'si dış sunucuya sızabiliyordu | Yalnızca `https://`; `referrerPolicy="no-referrer"`; boşsa yer tutucu. `tel:` bağlantısı temizlenir. |
| 9 | Müşterilere açık "AI Prompt" sayfası: iç kâr marjı/kur bilgisi ve **kimlik doğrulamasız, `CORS: *`, `...body` kabul eden** örnek Worker kodu | Müşteri panelinden kaldırıldı, dosyalar `docs/internal/` altına taşındı (pakete girmez). **O Worker kodunu olduğu gibi yayınlamayın.** |
| 10 | Güvenlik başlıkları yoktu | `public/_headers`: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy vb. Satır içi tema betiği `public/theme-init.js` dosyasına taşındı. |
| 11 | Girdi uzunluk sınırı yoktu | Form alanlarına ve talep kaydına sınırlar. |
| 12 | Onay penceresinde herhangi bir yerde Enter, geri alınamaz işlemi onaylıyordu | Enter kaldırıldı; tehlikeli işlemlerde odak "Vazgeç" düğmesinde başlar. |
| 13 | Oturum 7 gün | 24 saat. |

Erişilebilirlik/UX (UI-UX Pro Max kontrol listesine göre): "içeriğe atla" bağlantısı, etiket-alan ilişkisi, modal semantiği ve
Escape, 44 px dokunma hedefleri, ölü `href="#"` bağlantıları kaldırıldı (HashRouter'da ana sayfaya atıyordu).

## Yayınlamadan önce

1. `npm install && npm audit` çalıştırın (bu ortamda internet olmadığı için bağımlılık taraması yapılamadı).
2. `npm run build` ve çıkan `dist/` klasörünü Cloudflare Pages'e yükleyin. `public/_headers` otomatik uygulanır.
3. `VITE_ENABLE_DEMO_ACCOUNTS` değişkenini canlıda tanımlamayın veya `false` bırakın.
4. Cloudflare panelinde SSL/TLS → "Full (strict)" ve "Always Use HTTPS" açık olsun.
5. Yayından sonra https://securityheaders.com ve https://observatory.mozilla.org ile başlıkları doğrulayın.
