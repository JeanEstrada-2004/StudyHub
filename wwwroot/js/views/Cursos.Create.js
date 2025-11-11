// JS para Crear Curso: envía el formulario real y evita prompts al salir durante el envío
(function () {
  let isSubmitting = false;

  function byId(id) { return document.getElementById(id); }

  function actualizarContador() {
    const desc = byId('Descripcion');
    const badge = byId('contadorDescripcion');
    if (!desc || !badge) return;
    const len = desc.value.length;
    const max = 500;
    badge.textContent = `${len}/${max}`;
    badge.className = 'badge ' + (len > max ? 'bg-danger' : (len > max * 0.9 ? 'bg-warning text-dark' : 'bg-light text-muted'));
  }

  function beforeUnloadHandler(e) {
    if (isSubmitting) return;
    const form = byId('cursoForm');
    if (!form) return;
    const fd = new FormData(form);
    for (const [, v] of fd.entries()) {
      if (v && String(v).trim() !== '') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    }
  }

  function handleSubmit(e) {
    const form = byId('cursoForm');
    const btn = byId('btnSubmit');
    if (!form) return;

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Permitir el POST nativo; solo marcamos estado y UI
    isSubmitting = true;
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    if (btn) {
      btn.disabled = true;
      btn.classList.add('btn-loading');
      btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Creando curso...';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = byId('cursoForm');
    if (!form) return;
    form.addEventListener('submit', handleSubmit);
    const desc = byId('Descripcion');
    desc && desc.addEventListener('input', actualizarContador);
    actualizarContador();
    window.addEventListener('beforeunload', beforeUnloadHandler);
  });
})();

