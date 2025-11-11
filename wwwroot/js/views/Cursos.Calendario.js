// Alternar vistas de Lista / Calendario (placeholder)
document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('[data-vista]');
  const vLista = document.getElementById('vistaLista');
  const vCal = document.getElementById('vistaCalendario');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const v = b.getAttribute('data-vista');
    const lista = v === 'lista';
    if (vLista && vCal) {
      vLista.className = lista ? 'vista-activa' : 'vista-oculta';
      vCal.className = lista ? 'vista-oculta' : 'vista-activa';
    }
  }));
});

