// "İçeriğe atla" bağlantısı. HashRouter kullanıldığı için href="#main" yönlendirmeyi bozar;
// bu yüzden varsayılan davranış engellenir ve odak doğrudan <main id="main"> öğesine verilir.
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault()
        const el = document.getElementById('main')
        if (el) {
          el.focus()
          el.scrollIntoView({ block: 'start' })
        }
      }}
    >
      İçeriğe atla
    </a>
  )
}
