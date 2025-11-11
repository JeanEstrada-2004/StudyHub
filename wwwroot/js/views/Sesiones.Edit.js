// View-specific scripts for Sesiones/Edit
// wwwroot/js/views/Sesiones.Edit.js
class SesionesEdit {
    constructor() {
        this.form = document.getElementById('sesion-form');
        this.btnGuardar = document.getElementById('btn-guardar');
        this.validationSummary = document.getElementById('validation-summary');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRealTimeValidation();
        this.setupFormSubmission();
    }

    setupEventListeners() {
        // Validación en tiempo real para campos críticos
        const criticalFields = ['Titulo', 'FechaHora', 'ClaseId'];
        criticalFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
            }
        });

        // Manejar cambios en ubicación para mostrar/ocultar enlace de reunión
        const ubicacionField = document.querySelector('[name="Ubicacion"]');
        if (ubicacionField) {
            ubicacionField.addEventListener('input', () => this.toggleEnlaceReunion(ubicacionField.value));
        }

        // Validar formulario antes de enviar
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    setupRealTimeValidation() {
        // Validación automática para todos los campos con atributos de validación
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldValidation(field));
        });
    }

    setupFormSubmission() {
        // Manejar el envío del formulario
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitForm();
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        const validationMessage = field.parentElement.querySelector('.validation-message');

        // Limpiar estado anterior
        field.classList.remove('is-valid', 'is-invalid');
        if (validationMessage) validationMessage.textContent = '';

        // Validaciones específicas por campo
        switch (fieldName) {
            case 'Titulo':
                if (!value) {
                    this.showFieldError(field, 'El título es obligatorio');
                } else if (value.length < 3) {
                    this.showFieldError(field, 'El título debe tener al menos 3 caracteres');
                } else {
                    this.showFieldSuccess(field);
                }
                break;

            case 'FechaHora':
                if (!value) {
                    this.showFieldError(field, 'La fecha y hora son obligatorias');
                } else if (new Date(value) <= new Date()) {
                    this.showFieldError(field, 'La fecha debe ser futura');
                } else {
                    this.showFieldSuccess(field);
                }
                break;

            case 'DuracionMinutos':
                if (!value || value <= 0) {
                    this.showFieldError(field, 'La duración debe ser mayor a 0');
                } else {
                    this.showFieldSuccess(field);
                }
                break;

            case 'ClaseId':
                if (!value) {
                    this.showFieldError(field, 'Debe seleccionar una clase');
                } else {
                    this.showFieldSuccess(field);
                }
                break;
        }
    }

    showFieldError(field, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        const validationMessage = field.parentElement.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.textContent = message;
        }
    }

    showFieldSuccess(field) {
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
        
        const validationMessage = field.parentElement.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.textContent = '';
        }
    }

    clearFieldValidation(field) {
        field.classList.remove('is-invalid', 'is-valid');
        const validationMessage = field.parentElement.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.textContent = '';
        }
    }

    toggleEnlaceReunion(ubicacion) {
        const enlaceField = document.querySelector('[name="EnlaceReunion"]');
        const enlaceLabel = document.querySelector('label[for="EnlaceReunion"]');
        
        if (ubicacion && ubicacion.toLowerCase().includes('virtual')) {
            enlaceField.required = true;
            if (enlaceLabel) {
                enlaceLabel.innerHTML = 'Enlace de Reunión <span class="text-danger">*</span>';
            }
        } else {
            enlaceField.required = false;
            if (enlaceLabel) {
                enlaceLabel.innerHTML = 'Enlace de Reunión';
            }
        }
    }

    async submitForm() {
        // Validar todos los campos antes de enviar
        const fields = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            this.validateField(field);
            if (field.classList.contains('is-invalid')) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showToast('Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        // Mostrar estado de carga
        this.setLoadingState(true);

        try {
            // Crear FormData para enviar
            const formData = new FormData(this.form);

            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                this.showToast('Sesión actualizada correctamente', 'success');
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    window.location.href = '@Url.Action("Calendario")';
                }, 1500);
            } else {
                throw new Error('Error en la respuesta del servidor');
            }

        } catch (error) {
            console.error('Error al guardar la sesión:', error);
            this.showToast('Error al guardar la sesión. Inténtalo de nuevo.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        if (loading) {
            this.btnGuardar.classList.add('btn-loading');
            this.btnGuardar.disabled = true;
            this.form.classList.add('loading');
        } else {
            this.btnGuardar.classList.remove('btn-loading');
            this.btnGuardar.disabled = false;
            this.form.classList.remove('loading');
        }
    }

    showToast(message, type = 'info') {
        // Crear toast de Bootstrap
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        
        toast.className = `toast align-items-center text-bg-${type === 'success' ? 'success' : 'danger'} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Remover el toast después de que se oculte
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        this.submitForm();
    }
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    new SesionesEdit();
});

// Manejar la tecla Enter en el formulario
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});