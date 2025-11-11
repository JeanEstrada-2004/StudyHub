// Funcionalidad específica para la vista de Eliminar Curso - StudyHub
class EliminarCurso {
    constructor() {
        this.form = null;
        this.confirmText = null;
        this.btnDelete = null;
        this.checkboxes = [];
        this.expectedText = '';
        this.init();
    }
    
    init() {
        this.obtenerElementos();
        this.setupEventListeners();
        this.setupValidaciones();
    }
    
    obtenerElementos() {
        this.form = document.getElementById('deleteForm');
        this.confirmText = document.getElementById('confirmationText');
        this.btnDelete = document.getElementById('btnDelete');
        this.checkboxes = [
            document.getElementById('confirmUnderstanding'),
            document.getElementById('confirmBackup'),
            document.getElementById('confirmResponsibility')
        ];
        
        if (this.confirmText) {
            this.expectedText = this.confirmText.dataset.expected;
        }
    }
    
    setupEventListeners() {
        // Validación en tiempo real de checkboxes
        this.checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.actualizarEstadoBoton.bind(this));
        });
        
        // Validación en tiempo real del texto de confirmación
        if (this.confirmText) {
            this.confirmText.addEventListener('input', this.validarTextoConfirmacion.bind(this));
            this.confirmText.addEventListener('blur', this.validarTextoConfirmacion.bind(this));
        }
        
        // Confirmación adicional al enviar el formulario
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        // Prevención de navegación accidental
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
    
    setupValidaciones() {
        this.actualizarEstadoBoton();
    }
    
    validarTextoConfirmacion() {
        if (!this.confirmText) return;
        
        const textoIngresado = this.confirmText.value.trim();
        const esValido = textoIngresado === this.expectedText;
        
        if (textoIngresado === '') {
            this.confirmText.classList.remove('is-valid', 'is-invalid');
        } else if (esValido) {
            this.confirmText.classList.remove('is-invalid');
            this.confirmText.classList.add('is-valid');
        } else {
            this.confirmText.classList.remove('is-valid');
            this.confirmText.classList.add('is-invalid');
        }
        
        this.actualizarEstadoBoton();
    }
    
    actualizarEstadoBoton() {
        const todosCheckboxesMarcados = this.checkboxes.every(checkbox => checkbox.checked);
        const textoCorrecto = this.confirmText ? this.confirmText.value.trim() === this.expectedText : false;
        
        this.btnDelete.disabled = !(todosCheckboxesMarcados && textoCorrecto);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validarConfirmacionCompleta()) {
            this.mostrarMensaje('Por favor, complete todas las verificaciones de seguridad.', 'error');
            return;
        }
        
        // Confirmación final extrema
        const confirmacionFinal = await this.mostrarConfirmacionFinal();
        
        if (!confirmacionFinal) {
            return;
        }
        
        // Mostrar estado de carga
        this.mostrarEstadoCarga(true);
        
        try {
            // Simular procesamiento (en producción, esto sería la submission real)
            await this.simularEliminacion();
            
            // Éxito - Redirigir
            this.mostrarMensaje('Curso eliminado exitosamente. Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = '/Cursos';
            }, 2000);
            
        } catch (error) {
            this.mostrarEstadoCarga(false);
            this.mostrarMensaje('Error al eliminar el curso. Por favor, intente nuevamente.', 'error');
        }
    }
    
    validarConfirmacionCompleta() {
        const todosCheckboxesMarcados = this.checkboxes.every(checkbox => checkbox.checked);
        const textoCorrecto = this.confirmText ? this.confirmText.value.trim() === this.expectedText : false;
        
        return todosCheckboxesMarcados && textoCorrecto;
    }
    
    mostrarConfirmacionFinal() {
        return new Promise((resolve) => {
            // Crear modal de confirmación final
            const modalHTML = `
                <div class="modal fade" id="finalConfirmationModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-danger">
                            <div class="modal-header bg-danger text-white">
                                <h5 class="modal-title">
                                    <i class="bi bi-exclamation-octagon-fill me-2"></i>
                                    Confirmación Final
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body text-center">
                                <div class="warning-icon-sm mx-auto mb-3">
                                    <i class="bi bi-exclamation-triangle-fill"></i>
                                </div>
                                <h6 class="text-danger mb-3">¿Está absolutamente seguro?</h6>
                                <p class="mb-3">
                                    Esta es la última oportunidad para cancelar. Una vez confirmado, 
                                    el curso <strong>@Model.Nombre</strong> y todos sus datos asociados 
                                    se eliminarán permanentemente sin posibilidad de recuperación.
                                </p>
                                <div class="alert alert-warning small">
                                    <i class="bi bi-clock-history me-1"></i>
                                    Esta acción no se puede deshacer bajo ninguna circunstancia.
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-x-circle me-2"></i>Cancelar
                                </button>
                                <button type="button" class="btn btn-danger" id="confirmFinalDelete">
                                    <i class="bi bi-trash3-fill me-2"></i>Sí, Eliminar Permanentemente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modalElement = document.getElementById('finalConfirmationModal');
            const modal = new bootstrap.Modal(modalElement);
            
            // Configurar event listeners
            modalElement.addEventListener('shown.bs.modal', () => {
                document.getElementById('confirmFinalDelete').focus();
            });
            
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
                resolve(false);
            });
            
            document.getElementById('confirmFinalDelete').addEventListener('click', () => {
                modal.hide();
                resolve(true);
            });
            
            // Mostrar modal
            modal.show();
        });
    }
    
    async simularEliminacion() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // En una implementación real, aquí se haría la submission del formulario
                // Por ahora, simulamos un 95% de éxito
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Error de simulación en la eliminación'));
                }
            }, 2000);
        });
    }
    
    mostrarEstadoCarga(mostrar) {
        if (mostrar) {
            this.btnDelete.disabled = true;
            this.btnDelete.classList.add('btn-loading');
            this.btnDelete.innerHTML = '<i class="bi bi-trash3 me-2"></i>Eliminando...';
        } else {
            this.actualizarEstadoBoton();
            this.btnDelete.classList.remove('btn-loading');
            this.btnDelete.innerHTML = '<i class="bi bi-trash3 me-2"></i>Eliminar Curso Permanentemente';
        }
    }
    
    mostrarMensaje(mensaje, tipo = 'info') {
        // Crear o reutilizar contenedor de mensajes
        let alertContainer = document.getElementById('alertMessages');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alertMessages';
            alertContainer.className = 'position-fixed top-0 end-0 p-3';
            alertContainer.style.zIndex = '1060';
            document.body.appendChild(alertContainer);
        }
        
        const alertId = 'alert-' + Date.now();
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <i class="bi ${this.obtenerIconoAlerta(tipo)} me-2"></i>
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }
    
    obtenerIconoAlerta(tipo) {
        const iconos = {
            'success': 'bi-check-circle-fill',
            'error': 'bi-exclamation-triangle-fill',
            'warning': 'bi-exclamation-triangle-fill',
            'info': 'bi-info-circle-fill'
        };
        return iconos[tipo] || 'bi-info-circle-fill';
    }
    
    handleBeforeUnload(e) {
        // Verificar si el formulario está parcialmente completado
        const algunCheckboxMarcado = this.checkboxes.some(checkbox => checkbox.checked);
        const textoIngresado = this.confirmText && this.confirmText.value.trim() !== '';
        
        if (algunCheckboxMarcado || textoIngresado) {
            e.preventDefault();
            e.returnValue = 'Tiene una eliminación de curso en progreso. ¿Está seguro de que desea salir?';
            return e.returnValue;
        }
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    new EliminarCurso();
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la vista de eliminar curso:', e.error);
});

// Estilos adicionales para el modal de confirmación
const style = document.createElement('style');
style.textContent = `
    .warning-icon-sm {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #dc3545, #c82333);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
    }
`;
document.head.appendChild(style);