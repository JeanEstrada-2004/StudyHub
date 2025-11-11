// JS aislado para Layout (no intrusivo)
document.addEventListener('DOMContentLoaded', function () {
  try {
    // Marcar activo el link de navbar según la ruta
    const current = location.pathname.toLowerCase();
    document.querySelectorAll('nav a.nav-link').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href && current.startsWith(href)) {
        a.classList.add('active');
      }
    });
  } catch {}
});
