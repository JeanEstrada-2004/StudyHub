// View-specific scripts for Sesiones/Edit
// wwwroot/js/views/Sesiones.Edit.js

class SesionesEdit {
    constructor() {
        this.form = document.getElementById('sesion-form');
        this.btnGuardar = document.getElementById('btn-guardar');
        this.validationSummary = document.getElementById('validation-summary');
        this.tipoSesionRadios = document.querySelectorAll('input[name="TipoSesion"]');
        this.grupoUbicacion = document.getElementById('grupoUbicacion');
        this.grupoEnlace = document.getElementById('grupoEnlace');

        this.init();
    }

    init() {
        if (!this.form) return;

        this.setupEventListeners();
        this.setupRealTimeValidation();
        this.actualizarCamposSegunTipo();
    }

    setupEventListeners() {
        // Validación en tiempo real para campos críticos
        const criticalFields = ['Titulo', 'FechaHora', 'ClaseId'];
        criticalFields.forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => this.validateField(field));
            }
        });

        // Cambio de tipo de sesión
        if (this.tipoSesionRadios && this.tipoSesionRadios.length > 0) {
            this.tipoSesionRadios.forEach(radio => {
                radio.addEventListener('change', () => this.actualizarCamposSegunTipo());
            });
        }

        // Manejar el envío del formulario (AJAX)
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }

    setupRealTimeValidation() {
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldValidation(field));
        });
    }

    obtenerTipoSesionActual() {
        if (!this.tipoSesionRadios || this.tipoSesionRadios.length === 0) {
            return 'Presencial';
        }
        const seleccionado = Array.from(this.tipoSesionRadios).find(r => r.checked);
        return seleccionado ? seleccionado.value : 'Presencial';
    }

    actualizarCamposSegunTipo() {
        const tipo = this.obtenerTipoSesionActual();
        const campoUbicacion = this.form.querySelector('[name="Ubicacion"]');
        const campoEnlace = this.form.querySelector('[name="EnlaceReunion"]');

        const esVirtual = tipo === 'Virtual';

        if (this.grupoUbicacion) {
            this.grupoUbicacion.style.display = esVirtual ? 'none' : '';
        }
        if (this.grupoEnlace) {
            this.grupoEnlace.style.display = esVirtual ? '' : 'none';
        }

        if (campoUbicacion) {
            campoUbicacion.required = !esVirtual;
        }
        if (campoEnlace) {
            campoEnlace.required = esVirtual;
        }
    }

    validateField(field) {
        const value = (field.value || '').trim();
        const fieldName = field.getAttribute('name');
        const validationMessage = field.parentElement.querySelector('.validation-message');

        field.classList.remove('is-valid', 'is-invalid');
        if (validationMessage) validationMessage.textContent = '';

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
                if (!value || parseInt(value, 10) <= 0) {
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

    async submitForm() {
        const fields = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            this.validateField(field);
            if (field.classList.contains('is-invalid')) {
                isValid = false;
            }
        });

        const tipo = this.obtenerTipoSesionActual();
        const campoUbicacion = this.form.querySelector('[name="Ubicacion"]');
        const campoEnlace = this.form.querySelector('[name="EnlaceReunion"]');

        if (tipo === 'Virtual' && campoEnlace && !campoEnlace.value) {
            this.showFieldError(campoEnlace, 'Para sesiones virtuales debes ingresar el enlace de reunión');
            isValid = false;
        }

        if (tipo === 'Presencial' && campoUbicacion && !campoUbicacion.value) {
            this.showFieldError(campoUbicacion, 'Para sesiones presenciales debes indicar la ubicación');
            isValid = false;
        }

        if (!isValid) {
            this.showToast('Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        this.setLoadingState(true);

        try {
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
                setTimeout(() => {
                    window.location.href = '/Sesiones/Calendario';
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
        if (!this.btnGuardar) return;

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
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        const toast = document.createElement('div');

        const bgType = type === 'success' ? 'success' : 'danger';
        const icon = type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle';

        toast.className = `toast align-items-center text-bg-${bgType} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${icon} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

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
}

// Inicializar cuando el documento está listo
document.addEventListener('DOMContentLoaded', function () {
    new SesionesEdit();
});

// Prevenir Enter para enviar el formulario accidentalmente (excepto en textareas)
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

