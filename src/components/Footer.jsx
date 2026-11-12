export default function Footer() {
  return (
    <footer className="mt-12 border-t border-edge">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hanko" aria-hidden="true">日</div>
            <div>
              <p className="font-display font-bold text-sm text-warm">NipponExpress TR</p>
              <p className="text-[11px] text-faint font-jp">日本からトルコへ · Proxy Shopping</p>
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-faint mt-6">
          © 2026 NipponExpress TR · Tahmini kur bilgisi verilir, kesin güvence içermez. · Önizleme sürümü.
        </p>
      </div>
    </footer>
  )
}
