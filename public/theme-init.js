// FOUC engelle: tema tercihi yüklenmeden önce uygula.
// Satır içi script yerine harici dosya kullanılır; böylece CSP'de 'unsafe-inline' gerekmez.
(function () {
  try {
    var t = localStorage.getItem('nx_theme');
    if (!t) {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
