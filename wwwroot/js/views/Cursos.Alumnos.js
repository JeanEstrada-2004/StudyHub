// Funcionalidad específica para la vista de Estudiantes del Curso - StudyHub
class GestionEstudiantes {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkEmptyState();
        this.setupFilters();
    }
    
    setupEventListeners() {
        // Formulario de invitación
        const invitacionForm = document.getElementById('invitacionForm');
        if (invitacionForm) {
            invitacionForm.addEventListener('submit', this.handleInvitacion.bind(this));
        }
        
        // Búsqueda en tiempo real
        const inputBusqueda = document.getElementById('inputBusqueda');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', this.handleBusqueda.bind(this));
        }
        
        // Confirmación para acciones de aceptar/rechazar
        this.setupConfirmaciones();
    }
    
    setupFilters() {
        const btnFiltros = document.getElementById('btnFiltros');
        if (btnFiltros) {
            btnFiltros.addEventListener('click', this.mostrarFiltros.bind(this));
        }
    }
    
    handleInvitacion(e) {
        const btn = document.getElementById('btnInvitar');
        const originalText = btn.innerHTML;
        
        // Mostrar estado de carga
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Enviando...';
        
        // Simular delay para mejor UX (en producción esto sería real)
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1500);
    }
    
    handleBusqueda(e) {
        const termino = e.target.value.toLowerCase();
        const filas = document.querySelectorAll('#tablaEstudiantes tbody tr');
        let resultadosVisibles = 0;
        
        filas.forEach(fila => {
            const textoFila = fila.textContent.toLowerCase();
            if (textoFila.includes(termino)) {
                fila.style.display = '';
                resultadosVisibles++;
            } else {
                fila.style.display = 'none';
            }
        });
        
        this.actualizarEstadoBusqueda(resultadosVisibles);
    }
    
    actualizarEstadoBusqueda(resultados) {
        const emptyState = document.getElementById('emptyState');
        const tableContainer = document.getElementById('tableContainer');
        
        if (resultados === 0) {
            emptyState.classList.remove('d-none');
            emptyState.innerHTML = `
                <i class="bi bi-search display-1 text-muted"></i>
                <h5 class="mt-3 text-muted">No se encontraron estudiantes</h5>
                <p class="text-muted">Intenta con otros términos de búsqueda</p>
            `;
            tableContainer.classList.add('d-none');
        } else {
            emptyState.classList.add('d-none');
            tableContainer.classList.remove('d-none');
        }
    }
    
    mostrarFiltros() {
        // En una implementación completa, esto mostraría un modal con opciones de filtrado
        alert('Funcionalidad de filtros avanzados - Próximamente');
    }
    
    setupConfirmaciones() {
        const forms = document.querySelectorAll('form[action*="Aceptar"], form[action*="Rechazar"]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const accion = form.action.includes('Aceptar') ? 'aceptar' : 'rechazar';
                const mensaje = accion === 'aceptar' 
                    ? '¿Estás seguro de que quieres aceptar a este estudiante?' 
                    : '¿Estás seguro de que quieres rechazar a este estudiante?';
                
                if (!confirm(mensaje)) {
                    e.preventDefault();
                }
            });
        });
    }
    
    checkEmptyState() {
        const filas = document.querySelectorAll('#tablaEstudiantes tbody tr');
        const emptyState = document.getElementById('emptyState');
        const tableContainer = document.getElementById('tableContainer');
        
        if (filas.length === 0) {
            emptyState.classList.remove('d-none');
            tableContainer.classList.add('d-none');
        } else {
            emptyState.classList.add('d-none');
            tableContainer.classList.remove('d-none');
        }
    }
    
    // Método para mostrar toast de feedback (complementario a las alertas)
    mostrarToast(mensaje, tipo = 'success') {
        const toastContainer = document.getElementById('toastContainer') || this.crearToastContainer();
        const toastId = 'toast-' + Date.now();
        
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-bg-${tipo} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi ${tipo === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2"></i>
                        ${mensaje}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Limpiar después de que se oculta
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
    
    crearToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1060';
        document.body.appendChild(container);
        return container;
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    new GestionEstudiantes();
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la vista de gestión de estudiantes:', e.error);
});