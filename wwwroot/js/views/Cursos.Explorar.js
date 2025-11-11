// Funcionalidad para Explorar Cursos (toggle grid/list + filtros)
class CursosExplorar {
  constructor() {
    this.vistaActual = 'grid';
    this.cursos = [];
    this.filtros = { busqueda: '', estado: 'todos' };
    this.init();
  }

  init() {
    this.cargarCursos();
    this.setupCambioVista();
    this.setupFiltros();
    this.aplicarFiltros();
  }

  cargarCursos() {
    const gridElems = Array.from(document.querySelectorAll('.curso-card'));
    const listElems = Array.from(document.querySelectorAll('.curso-list-item'));

    this.cursos = gridElems.map((el, idx) => {
      const nombre = (el.querySelector('.curso-titulo')?.textContent || '').toLowerCase();
      const codigo = (el.querySelector('.curso-codigo')?.textContent || '').toLowerCase();
      const estado = (el.getAttribute('data-estado') || '').toLowerCase();
      return {
        elementoGrid: el,
        elementoLista: listElems[idx],
        nombre,
        codigo,
        estado
      };
    });
  }

  setupCambioVista() {
    const radios = document.querySelectorAll('input[name="btnViewType"]');
    radios.forEach(r => r.addEventListener('change', (e) => {
      this.cambiarVista(e.target.id === 'btnViewGrid' ? 'grid' : 'lista');
    }));
  }

  cambiarVista(vista) {
    this.vistaActual = vista;
    const grid = document.getElementById('vistaGrid');
    const list = document.getElementById('vistaLista');
    if (vista === 'grid') {
      grid?.classList.remove('vista-oculta');
      grid?.classList.add('vista-activa');
      list?.classList.remove('vista-activa');
      list?.classList.add('vista-oculta');
    } else {
      list?.classList.remove('vista-oculta');
      list?.classList.add('vista-activa');
      grid?.classList.remove('vista-activa');
      grid?.classList.add('vista-oculta');
    }
  }

  setupFiltros() {
    const q = document.getElementById('inputBusqueda');
    const sel = document.getElementById('filtroEstado');
    const resetBtn = document.getElementById('btnResetFiltros');

    q?.addEventListener('input', (e) => { this.filtros.busqueda = (e.target.value || '').toLowerCase(); this.aplicarFiltros(); });
    sel?.addEventListener('change', (e) => { this.filtros.estado = e.target.value; this.aplicarFiltros(); });
    resetBtn?.addEventListener('click', () => {
      if (q) q.value = '';
      if (sel) sel.value = 'todos';
      this.filtros.busqueda = '';
      this.filtros.estado = 'todos';
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    let visibles = 0;
    const term = this.filtros.busqueda;
    const state = this.filtros.estado;

    this.cursos.forEach(c => {
      let show = true;
      if (term) {
        const match = c.nombre.includes(term) || c.codigo.includes(term);
        if (!match) show = false;
      }
      if (state !== 'todos' && c.estado !== state) show = false;

      [c.elementoGrid, c.elementoLista].forEach(el => {
        if (!el) return;
        el.style.display = show ? '' : 'none';
      });
      if (show) visibles++;
    });

    const contador = document.getElementById('contadorCursos');
    if (contador) contador.textContent = String(visibles);

    const empty = document.getElementById('emptyState');
    const gridCursos = document.getElementById('gridCursos');
    const listaCursos = document.getElementById('listaCursos');
    if (visibles === 0 && this.cursos.length > 0) {
      empty?.classList.remove('d-none');
      gridCursos?.classList.add('d-none');
      listaCursos?.classList.add('d-none');
    } else {
      empty?.classList.add('d-none');
      if (this.vistaActual === 'grid') {
        gridCursos?.classList.remove('d-none');
        listaCursos?.classList.add('d-none');
      } else {
        gridCursos?.classList.add('d-none');
        listaCursos?.classList.remove('d-none');
      }
    }

    // Si no hay cursos en absoluto, mostrar estado vacío
    if (this.cursos.length === 0) {
      empty?.classList.remove('d-none');
      gridCursos?.classList.add('d-none');
      listaCursos?.classList.add('d-none');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new CursosExplorar());
