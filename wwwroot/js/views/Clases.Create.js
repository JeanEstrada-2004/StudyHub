// JS para Crear Clase: validar required y permitir post nativo con UI de carga
(function () {
  function byId(id) { return document.getElementById(id); }

  function validateRequiredFields(form) {
    const required = form.querySelectorAll('[required]');
    for (const f of required) {
      if (!String(f.value || '').trim()) return false;
      if (f.type === 'number') {
        const v = parseInt(f.value || '0');
        const min = parseInt(f.getAttribute('min') || '1');
        const max = parseInt(f.getAttribute('max') || '100');
        if (v < min || v > max) return false;
      }
    }
    return true;
  }

  function setLoading(isLoading) {
    const btn = byId('createButton');
    if (!btn) return;
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    if (isLoading) {
      btnText && btnText.classList.add('d-none');
      btnLoading && btnLoading.classList.remove('d-none');
      btn.disabled = true;
    } else {
      btnText && btnText.classList.remove('d-none');
      btnLoading && btnLoading.classList.add('d-none');
      btn.disabled = false;
    }
  }

  function onSubmit(e) {
    const form = byId('createClassForm');
    if (!form) return;
    if (!validateRequiredFields(form)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setLoading(true);
    // Permitir POST nativo
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = byId('createClassForm');
    if (!form) return;
    form.addEventListener('submit', onSubmit);
  });
})();

