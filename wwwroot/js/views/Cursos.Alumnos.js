// Funcionalidad específica para la vista de Estudiantes del Curso - StudyHub
class GestionEstudiantes {
    constructor() {
        this.inviteInput = null;
        this.inviteSuggestions = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupInviteSuggestions();
        this.checkEmptyState();
        this.setupFilters();
    }
    
    setupEventListeners() {
        // Formulario de invitación
        const invitacionForm = document.getElementById('invitacionForm');
        if (invitacionForm) {
            invitacionForm.addEventListener('submit', this.handleInvitacion.bind(this));
        }
        
        // Búsqueda en tiempo real (por nombre o email)
        const inputBusqueda = document.getElementById('inputBusqueda');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', this.handleBusqueda.bind(this));
        }
        
        // Confirmación para acciones (aceptar, rechazar, eliminar)
        this.setupConfirmaciones();
    }

    setupInviteSuggestions() {
        this.inviteInput = document.getElementById('terminoInvitacion');
        this.inviteSuggestions = document.getElementById('inviteSuggestions');

        if (!this.inviteInput || !this.inviteSuggestions) return;

        const items = Array.from(this.inviteSuggestions.querySelectorAll('.invite-suggestion-item'));

        const filterSuggestions = () => {
            const term = this.inviteInput.value.trim().toLowerCase();

            // Solo mostrar sugerencias cuando se busca por nombre (sin @)
            if (!term || term.includes('@')) {
                this.hideInviteSuggestions();
                return;
            }

            let anyVisible = false;
            items.forEach(item => {
                const nombre = (item.dataset.nombre || '').toLowerCase();
                if (nombre.includes(term)) {
                    item.classList.remove('d-none');
                    anyVisible = true;
                } else {
                    item.classList.add('d-none');
                }
            });

            if (anyVisible) {
                this.inviteSuggestions.classList.remove('d-none');
            } else {
                this.hideInviteSuggestions();
            }
        };

        this.inviteInput.addEventListener('input', filterSuggestions);
        this.inviteInput.addEventListener('focus', filterSuggestions);

        // Seleccionar sugerencia
        this.inviteSuggestions.addEventListener('click', (e) => {
            const item = e.target.closest('.invite-suggestion-item');
            if (!item) return;

            // Al seleccionar, usar el correo en el campo para asegurar coincidencia exacta
            const email = item.dataset.email || '';
            this.inviteInput.value = email || item.dataset.nombre || '';
            this.hideInviteSuggestions();
            this.inviteInput.focus();
        });

        // Ocultar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!this.inviteInput.contains(e.target) && !this.inviteSuggestions.contains(e.target)) {
                this.hideInviteSuggestions();
            }
        });

        // Ocultar con Escape
        this.inviteInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideInviteSuggestions();
            }
        });
    }

    hideInviteSuggestions() {
        if (this.inviteSuggestions) {
            this.inviteSuggestions.classList.add('d-none');
        }
    }
    
    setupFilters() {
        const btnFiltros = document.getElementById('btnFiltros');
        if (btnFiltros) {
            btnFiltros.addEventListener('click', this.mostrarFiltros.bind(this));
        }
    }
    
    handleInvitacion(e) {
        const btn = document.getElementById('btnInvitar');
        if (!btn) return;

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
        const termino = e.target.value.toLowerCase().trim();
        const filas = document.querySelectorAll('#tablaEstudiantes tbody tr');
        let resultadosVisibles = 0;
        
        filas.forEach(fila => {
            if (!termino) {
                fila.style.display = '';
                resultadosVisibles++;
                return;
            }

            const nombre = (fila.dataset.nombre || '').toLowerCase();
            const email = (fila.dataset.email || '').toLowerCase();

            if (nombre.includes(termino) || email.includes(termino)) {
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
        
        if (!emptyState || !tableContainer) return;

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
        const forms = document.querySelectorAll(
            'form[action*="Aceptar"], form[action*="Rechazar"], form[action*="EliminarAlumno"]'
        );

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                let mensaje;
                if (form.action.includes('Aceptar')) {
                    mensaje = '¿Estás seguro de que quieres aceptar a este estudiante?';
                } else if (form.action.includes('Rechazar')) {
                    mensaje = '¿Estás seguro de que quieres rechazar a este estudiante?';
                } else {
                    mensaje = '¿Estás seguro de que quieres eliminar a este estudiante del curso? Esta acción no se puede deshacer.';
                }
                
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
        
        if (!emptyState || !tableContainer) return;

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

