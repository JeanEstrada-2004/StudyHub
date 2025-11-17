// View-specific scripts for Sesiones/Create
// Funcionalidad específica para la vista de Crear Sesión - StudyHub

class CrearSesion {
    constructor() {
        this.form = document.getElementById('sesionForm');
        this.descripcion = document.getElementById('Descripcion');
        this.contadorDescripcion = document.getElementById('contadorDescripcion');
        this.btnSubmit = document.getElementById('btnSubmit');
        this.fechaInput = document.querySelector('input[type="date"]');
        this.horaInput = document.getElementById('horaSesion');
        this.fechaHoraCompleta = document.getElementById('fechaHoraCompleta');
        this.tipoSesionRadios = document.querySelectorAll('input[name="TipoSesion"]');
        this.isSubmitting = false;

        this.init();
    }

    init() {
        if (!this.form) return;

        this.setupEventListeners();
        this.setupBootstrapValidation();
        this.setupDescripcionContador();
        this.setupFechaHora();
        this.setupVistaPrevia();
    }

    setupEventListeners() {
        // Submit del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Contador de descripción
        if (this.descripcion) {
            this.descripcion.addEventListener('input', () => this.actualizarContadorDescripcion());
        }

        // Cambios en fecha y hora
        if (this.fechaInput) {
            this.fechaInput.addEventListener('change', () => this.actualizarFechaHoraCompleta());
        }
        if (this.horaInput) {
            this.horaInput.addEventListener('change', () => this.actualizarFechaHoraCompleta());
        }

        // Validación en tiempo real para campos requeridos
        const campos = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        campos.forEach(campo => {
            campo.addEventListener('blur', () => this.validarCampo(campo));
            campo.addEventListener('input', () => {
                if (campo.classList.contains('is-invalid')) {
                    this.validarCampo(campo);
                }
            });
        });

        // Cambio de tipo de sesión (virtual / presencial)
        if (this.tipoSesionRadios && this.tipoSesionRadios.length > 0) {
            this.tipoSesionRadios.forEach(radio => {
                radio.addEventListener('change', () => this.actualizarCamposSegunTipo());
            });
            this.actualizarCamposSegunTipo();
        }

        // Prevención de salida con cambios sin guardar
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
    }

    setupBootstrapValidation() {
        this.form.addEventListener('submit', (event) => {
            if (!this.form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            this.form.classList.add('was-validated');
        }, false);
    }

    setupDescripcionContador() {
        if (this.descripcion && this.contadorDescripcion) {
            this.actualizarContadorDescripcion();
        }
    }

    setupFechaHora() {
        const hoy = new Date().toISOString().split('T')[0];
        if (this.fechaInput) {
            this.fechaInput.min = hoy;
            if (!this.fechaInput.value) {
                this.fechaInput.value = hoy;
            }
        }
        this.actualizarFechaHoraCompleta();
    }

    setupVistaPrevia() {
        const camposVistaPrevia = ['Titulo', 'ClaseId', 'DuracionMinutos', 'Ubicacion', 'Descripcion', 'EnlaceReunion'];
        camposVistaPrevia.forEach(nombre => {
            const campo = document.getElementById(nombre);
            if (campo) {
                campo.addEventListener('input', () => this.actualizarVistaPrevia());
                campo.addEventListener('change', () => this.actualizarVistaPrevia());
            }
        });

        this.actualizarVistaPrevia();
    }

    actualizarContadorDescripcion() {
        if (!this.descripcion || !this.contadorDescripcion) return;

        const longitud = this.descripcion.value.length;
        const maxLength = 1000;
        this.contadorDescripcion.textContent = `${longitud}/${maxLength}`;

        if (longitud > maxLength) {
            this.contadorDescripcion.className = 'badge bg-danger text-white';
        } else if (longitud > maxLength * 0.9) {
            this.contadorDescripcion.className = 'badge bg-warning text-dark';
        } else {
            this.contadorDescripcion.className = 'badge bg-light text-muted';
        }
    }

    actualizarFechaHoraCompleta() {
        if (!this.fechaInput || !this.horaInput || !this.fechaHoraCompleta) return;

        const fecha = this.fechaInput.value;
        const hora = this.horaInput.value;

        if (fecha && hora) {
            this.fechaHoraCompleta.value = `${fecha}T${hora}:00`;
        }
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
        const grupoUbicacion = document.getElementById('grupoUbicacion');
        const grupoEnlace = document.getElementById('grupoEnlace');
        const campoUbicacion = document.getElementById('Ubicacion');
        const campoEnlace = document.getElementById('EnlaceReunion');

        const esVirtual = tipo === 'Virtual';

        if (grupoUbicacion) {
            grupoUbicacion.style.display = esVirtual ? 'none' : '';
        }
        if (grupoEnlace) {
            grupoEnlace.style.display = esVirtual ? '' : 'none';
        }
        if (campoUbicacion) {
            campoUbicacion.required = !esVirtual;
        }
        if (campoEnlace) {
            campoEnlace.required = esVirtual;
        }

        this.actualizarVistaPrevia();
    }

    actualizarVistaPrevia() {
        const vistaPrevia = document.getElementById('vistaPreviaSesion');
        if (!vistaPrevia) return;

        const titulo = document.getElementById('Titulo')?.value || 'Título de la sesión';
        const fecha = this.fechaInput?.value || '';
        const hora = this.horaInput?.value || '';
        const duracion = parseInt(document.getElementById('DuracionMinutos')?.value || '60', 10);
        const ubicacion = document.getElementById('Ubicacion')?.value || 'No especificada';
        const descripcion = document.getElementById('Descripcion')?.value || '';
        const enlace = document.getElementById('EnlaceReunion')?.value || '';
        const tipo = this.obtenerTipoSesionActual();

        let contenido;

        if (!fecha && !hora && (!titulo || titulo === 'Título de la sesión')) {
            contenido = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-calendar3 display-6"></i>
                    <p class="mt-2 mb-0">La información de la sesión aparecerá aquí</p>
                </div>
            `;
        } else {
            let fechaHoraFormateada = 'Fecha y hora no especificadas';
            if (fecha && hora) {
                const fechaObj = new Date(`${fecha}T${hora}`);
                fechaHoraFormateada = fechaObj.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            const horas = Math.floor(duracion / 60);
            const minutos = duracion % 60;
            const duracionFormateada = horas > 0
                ? `${horas}h ${minutos > 0 ? minutos + 'min' : ''}`
                : `${minutos} min`;

            contenido = `
                <div class="sesion-preview">
                    <div class="fecha-hora">
                        <i class="bi bi-calendar3 me-2"></i>
                        ${fechaHoraFormateada}
                    </div>
                    <div class="titulo">${titulo}</div>
                    <div class="detalles">
                        <div class="mb-2">
                            <i class="bi bi-stopwatch me-2"></i>
                            <strong>Duración:</strong> ${duracionFormateada}
                        </div>
                        <div class="mb-2">
                            <i class="bi bi-geo-alt me-2"></i>
                            <strong>Modalidad:</strong> ${tipo === 'Virtual' ? 'Virtual' : 'Presencial'}${tipo === 'Presencial' ? ` - ${ubicacion}` : ''}
                        </div>
                        ${descripcion ? `
                        <div class="mb-2">
                            <i class="bi bi-card-text me-2"></i>
                            <strong>Descripción:</strong> ${descripcion.length > 100 ? descripcion.substring(0, 100) + '...' : descripcion}
                        </div>` : ''}
                        ${tipo === 'Virtual' && enlace ? `
                        <div class="mb-2">
                            <i class="bi bi-link-45deg me-2"></i>
                            <strong>Enlace:</strong>
                            <a href="${enlace}" target="_blank" class="text-primary">Unirse a la reunión</a>
                        </div>` : ''}
                    </div>
                </div>
            `;
        }

        vistaPrevia.innerHTML = contenido;
    }

    validarCampo(campo) {
        if (campo.checkValidity()) {
            campo.classList.remove('is-invalid');
            campo.classList.add('is-valid');
        } else {
            campo.classList.remove('is-valid');
            campo.classList.add('is-invalid');
        }
    }

    validarFechaHora() {
        if (!this.fechaInput || !this.horaInput) return false;

        const fecha = this.fechaInput.value;
        const hora = this.horaInput.value;
        if (!fecha || !hora) return false;

        const seleccionada = new Date(`${fecha}T${hora}`);
        const ahora = new Date();

        if (seleccionada < ahora) {
            this.fechaInput.classList.add('is-invalid');
            this.horaInput.classList.add('is-invalid');
            return false;
        }

        this.fechaInput.classList.remove('is-invalid');
        this.horaInput.classList.remove('is-invalid');
        return true;
    }

    async handleSubmit(e) {
        const tipo = this.obtenerTipoSesionActual();
        const campoUbicacion = document.getElementById('Ubicacion');
        const campoEnlace = document.getElementById('EnlaceReunion');

        // Validación específica por tipo
        if (tipo === 'Virtual' && campoEnlace && !campoEnlace.value) {
            e.preventDefault();
            this.validarCampo(campoEnlace);
            this.mostrarMensaje('Para sesiones virtuales debes ingresar el enlace de reunión.', 'error');
            return;
        }

        if (tipo === 'Presencial' && campoUbicacion && !campoUbicacion.value) {
            e.preventDefault();
            this.validarCampo(campoUbicacion);
            this.mostrarMensaje('Para sesiones presenciales debes indicar la ubicación.', 'error');
            return;
        }

        if (!this.validarFechaHora()) {
            e.preventDefault();
            this.mostrarMensaje('Por favor, selecciona una fecha y hora válidas.', 'error');
            return;
        }

        if (!this.form.checkValidity()) {
            e.preventDefault();
            this.form.classList.add('was-validated');
            this.mostrarMensaje('Por favor, completa todos los campos requeridos correctamente.', 'error');
            return;
        }

        // Todas las validaciones pasaron, permitir el submit normal
        this.isSubmitting = true;
    }

    mostrarMensaje(mensaje, tipo = 'info') {
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

        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }

    obtenerIconoAlerta(tipo) {
        const iconos = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-triangle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        return iconos[tipo] || 'bi-info-circle-fill';
    }

    handleBeforeUnload(e) {
        if (this.isSubmitting || !this.form) return;

        const formData = new FormData(this.form);
        let hasChanges = false;

        for (const [, value] of formData.entries()) {
            if (value && value.toString().trim() !== '') {
                hasChanges = true;
                break;
            }
        }

        if (hasChanges) {
            e.preventDefault();
            e.returnValue = 'Tiene cambios sin guardar. ¿Está seguro de que desea salir?';
            return e.returnValue;
        }
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function () {
    new CrearSesion();
});

// Manejo de errores global
window.addEventListener('error', function (e) {
    console.error('Error en la vista de crear sesión:', e.error);
});

