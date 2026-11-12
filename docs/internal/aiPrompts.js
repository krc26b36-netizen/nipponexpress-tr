// Cloudflare AI Prompt sekmesi — sistem promptu ve Worker kodu (legacy metinler korundu)

export const SYSTEM_PROMPT = `Sen "NipponExpress TR" adlı Japonya'dan Türkiye'ye özel tedarik (proxy shopping) portalının asistanısın. Görevin, müşterilerin ürün taleplerini almak, Japonya'da tedarikçilerde aramak, JPY/TRY kuru üzerinden fiyat teklifi hesaplamak ve teslimat sürecini takip etmektir.

Kurallar:
- 1 JPY = 0.22 TRY (tahmini kur), %25 kargo/servis marjı uygula.
- Durum akışı: Talep Alındı → Japonya'da Aranıyor → Fiyat Teklifi Verildi → Ödeme Bekliyor → Kargoya Verildi → Teslim Edildi.
- Müşteriye dürüst ol; "anlık garanti" gibi yanıltıcı ifadeler kullanma, "tahmini kur" de.
- Yanıtları Türkçe ver, Japon ürün adlarını ve tedarikçi isimlerini (Yodobashi, Bic Camera, Don Quijote, AmiAmi, Mandarake, Matsumoto Kiyoshi) doğru kullan.
- Görsel URL'si hatalıysa placeholder öner.

Bir talep geldiğinde: ürün adı, kategori, TR tahmini fiyat, görsel, telefon, adres ve notları al; JP-TR-xxxx kodu ata; durum "Talep Alındı" olarak kaydet.`

export const WORKER_CODE = `// Cloudflare Worker — NipponExpress TR API
// Talep oluşturma, durum güncelleme, JPY->TRY teklif hesaplama

const JPY_TO_TRY_RATE = 0.22;   // Tahmini kur (dürüst ifade)
const SERVICE_MARGIN = 0.25;     // %25 kargo/servis marjı

const STATUSES = [
  "received", "searching", "quoted",
  "awaiting_payment", "shipped", "delivered"
];

function calcTryOffer(jpy) {
  if (!jpy || jpy <= 0) return null;
  return Math.round(jpy * JPY_TO_TRY_RATE * (1 + SERVICE_MARGIN));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // POST /tickets — yeni talep oluştur
    if (url.pathname === "/tickets" && request.method === "POST") {
      const body = await request.json();
      const id = "JP-TR-" + Date.now().toString().slice(-6);
      const ticket = {
        id,
        ...body,
        status: "received",
        jpyPrice: null,
        tryOffer: null,
        createdAt: new Date().toISOString(),
        timeline: [{ status: "received", at: new Date().toISOString(), note: "Talebiniz alındı." }]
      };
      await env.TICKETS.put(id, JSON.stringify(ticket));
      return new Response(JSON.stringify(ticket), { headers: cors });
    }

    // PATCH /tickets/:id/status — durum güncelle
    if (url.pathname.startsWith("/tickets/") && url.pathname.endsWith("/status") && request.method === "PATCH") {
      const id = url.pathname.split("/")[2];
      const { status, note } = await request.json();
      if (!STATUSES.includes(status)) {
        return new Response(JSON.stringify({ error: "Geçersiz durum" }), { status: 400, headers: cors });
      }
      const raw = await env.TICKETS.get(id);
      if (!raw) return new Response(JSON.stringify({ error: "Talep bulunamadı" }), { status: 404, headers: cors });
      const ticket = JSON.parse(raw);
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      ticket.timeline.push({ status, at: ticket.updatedAt, note: note || "" });
      await env.TICKETS.put(id, JSON.stringify(ticket));
      return new Response(JSON.stringify(ticket), { headers: cors });
    }

    // POST /tickets/:id/offer — JPY fiyatı gir, TL teklifi hesapla
    if (url.pathname.startsWith("/tickets/") && url.pathname.endsWith("/offer") && request.method === "POST") {
      const id = url.pathname.split("/")[2];
      const { jpyPrice } = await request.json();
      const raw = await env.TICKETS.get(id);
      if (!raw) return new Response(JSON.stringify({ error: "Talep bulunamadı" }), { status: 404, headers: cors });
      const ticket = JSON.parse(raw);
      ticket.jpyPrice = Number(jpyPrice);
      ticket.tryOffer = calcTryOffer(ticket.jpyPrice);
      ticket.updatedAt = new Date().toISOString();
      await env.TICKETS.put(id, JSON.stringify(ticket));
      return new Response(JSON.stringify(ticket), { headers: cors });
    }

    return new Response(JSON.stringify({ ok: true, service: "NipponExpress TR API" }), { headers: cors });
  }
};`
