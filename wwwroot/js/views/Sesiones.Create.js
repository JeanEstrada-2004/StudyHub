// View-specific scripts for Sesiones/Create
// Funcionalidad específica para la vista de Crear Sesión - StudyHub
class CrearSesion {
    constructor() {
        this.form = null;
        this.descripcion = null;
        this.contadorDescripcion = null;
        this.btnSubmit = null;
        this.fechaInput = null;
        this.horaInput = null;
        this.fechaHoraCompleta = null;
        this.init();
    }
    
    init() {
        this.obtenerElementos();
        this.setupEventListeners();
        this.setupValidacion();
        this.setupDescripcionContador();
        this.setupFechaHora();
        this.setupVistaPrevia();
    }
    
    obtenerElementos() {
        this.form = document.getElementById('sesionForm');
        this.descripcion = document.getElementById('Descripcion');
        this.contadorDescripcion = document.getElementById('contadorDescripcion');
        this.btnSubmit = document.getElementById('btnSubmit');
        this.fechaInput = document.querySelector('input[type="date"]');
        this.horaInput = document.getElementById('horaSesion');
        this.fechaHoraCompleta = document.getElementById('fechaHoraCompleta');
    }
    
    setupEventListeners() {
        // Validación en tiempo real
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        // Contador de descripción
        if (this.descripcion) {
            this.descripcion.addEventListener('input', this.actualizarContadorDescripcion.bind(this));
        }
        
        // Cambios en fecha y hora
        if (this.fechaInput) {
            this.fechaInput.addEventListener('change', this.actualizarFechaHoraCompleta.bind(this));
        }
        
        if (this.horaInput) {
            this.horaInput.addEventListener('change', this.actualizarFechaHoraCompleta.bind(this));
        }
        
        // Validación de campos
        this.setupValidacionEnTiempoReal();
        
        // Actualización de vista previa
        this.setupActualizacionVistaPrevia();
        
        // Prevención de navegación con cambios sin guardar
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
    
    setupValidacion() {
        // Bootstrap validation
        if (this.form) {
            this.form.addEventListener('submit', (event) => {
                if (!this.form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                
                this.form.classList.add('was-validated');
            }, false);
        }
    }
    
    setupDescripcionContador() {
        if (this.descripcion && this.contadorDescripcion) {
            this.actualizarContadorDescripcion();
        }
    }
    
    setupFechaHora() {
        // Establecer fecha mínima como hoy
        const hoy = new Date().toISOString().split('T')[0];
        if (this.fechaInput) {
            this.fechaInput.min = hoy;
            
            // Si no hay valor, establecer como hoy
            if (!this.fechaInput.value) {
                this.fechaInput.value = hoy;
            }
        }
        
        // Actualizar fecha y hora completa inicial
        this.actualizarFechaHoraCompleta();
    }
    
    setupVistaPrevia() {
        // Actualizar vista previa cuando cambien los campos relevantes
        const camposVistaPrevia = ['Titulo', 'ClaseId', 'DuracionMinutos', 'Ubicacion', 'Descripcion', 'EnlaceReunion'];
        
        camposVistaPrevia.forEach(campoNombre => {
            const campo = document.getElementById(campoNombre);
            if (campo) {
                campo.addEventListener('input', this.actualizarVistaPrevia.bind(this));
                campo.addEventListener('change', this.actualizarVistaPrevia.bind(this));
            }
        });
        
        // Actualizar vista previa inicial
        this.actualizarVistaPrevia();
    }
    
    setupValidacionEnTiempoReal() {
        const campos = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        
        campos.forEach(campo => {
            campo.addEventListener('blur', () => {
                this.validarCampo(campo);
            });
            
            campo.addEventListener('input', () => {
                if (campo.classList.contains('is-invalid')) {
                    this.validarCampo(campo);
                }
            });
        });
    }
    
    setupActualizacionVistaPrevia() {
        // Los event listeners ya están configurados en setupVistaPrevia
    }
    
    actualizarContadorDescripcion() {
        const longitud = this.descripcion.value.length;
        const maxLength = 1000;
        this.contadorDescripcion.textContent = `${longitud}/${maxLength}`;
        
        // Cambiar color según la longitud
        if (longitud > maxLength * 0.9) {
            this.contadorDescripcion.className = 'badge bg-warning text-dark';
        } else if (longitud > maxLength) {
            this.contadorDescripcion.className = 'badge bg-danger text-white';
        } else {
            this.contadorDescripcion.className = 'badge bg-light text-muted';
        }
    }
    
    actualizarFechaHoraCompleta() {
        if (this.fechaInput && this.horaInput && this.fechaHoraCompleta) {
            const fecha = this.fechaInput.value;
            const hora = this.horaInput.value;
            
            if (fecha && hora) {
                const fechaHora = `${fecha}T${hora}:00`;
                this.fechaHoraCompleta.value = fechaHora;
            }
        }
    }
    
    actualizarVistaPrevia() {
        const vistaPrevia = document.getElementById('vistaPreviaSesion');
        const titulo = document.getElementById('Titulo')?.value || 'Título de la sesión';
        const fecha = this.fechaInput?.value || '';
        const hora = this.horaInput?.value || '';
        const duracion = document.getElementById('DuracionMinutos')?.value || '60';
        const ubicacion = document.getElementById('Ubicacion')?.value || 'No especificada';
        const descripcion = document.getElementById('Descripcion')?.value || '';
        const enlace = document.getElementById('EnlaceReunion')?.value || '';
        
        let contenidoVistaPrevia = '';
        
        if (titulo === 'Título de la sesión' && !fecha && !hora) {
            contenidoVistaPrevia = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-calendar3 display-6"></i>
                    <p class="mt-2 mb-0">La información de la sesión aparecerá aquí</p>
                </div>
            `;
        } else {
            // Formatear fecha y hora
            let fechaHoraFormateada = '';
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
            
            // Formatear duración
            const horas = Math.floor(duracion / 60);
            const minutos = duracion % 60;
            let duracionFormateada = '';
            if (horas > 0) {
                duracionFormateada = `${horas}h ${minutos > 0 ? minutos + 'min' : ''}`;
            } else {
                duracionFormateada = `${minutos} min`;
            }
            
            contenidoVistaPrevia = `
                <div class="sesion-preview">
                    <div class="fecha-hora">
                        <i class="bi bi-calendar3 me-2"></i>
                        ${fechaHoraFormateada || 'Fecha y hora no especificadas'}
                    </div>
                    <div class="titulo">${titulo}</div>
                    <div class="detalles">
                        <div class="mb-2">
                            <i class="bi bi-stopwatch me-2"></i>
                            <strong>Duración:</strong> ${duracionFormateada}
                        </div>
                        <div class="mb-2">
                            <i class="bi bi-geo-alt me-2"></i>
                            <strong>Ubicación:</strong> ${ubicacion}
                        </div>
                        ${descripcion ? `
                        <div class="mb-2">
                            <i class="bi bi-card-text me-2"></i>
                            <strong>Descripción:</strong> ${descripcion.length > 100 ? descripcion.substring(0, 100) + '...' : descripcion}
                        </div>
                        ` : ''}
                        ${enlace ? `
                        <div class="mb-2">
                            <i class="bi bi-link-45deg me-2"></i>
                            <strong>Enlace:</strong> 
                            <a href="${enlace}" target="_blank" class="text-primary">Unirse a la reunión</a>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        vistaPrevia.innerHTML = contenidoVistaPrevia;
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
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar fecha y hora
        if (!this.validarFechaHora()) {
            this.mostrarMensaje('Por favor, selecciona una fecha y hora válidas.', 'error');
            return;
        }
        
        if (!this.form.checkValidity()) {
            this.form.classList.add('was-validated');
            this.mostrarMensaje('Por favor, completa todos los campos requeridos correctamente.', 'error');
            return;
        }
        
        // Mostrar estado de carga
        this.mostrarEstadoCarga(true);
        
        try {
            // Simular procesamiento (en producción, esto sería la submission real)
            await this.simularGuardado();
            
            // Éxito
            this.mostrarMensaje('¡Sesión programada exitosamente! Redirigiendo al calendario...', 'success');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = '/Sesiones/Calendario';
            }, 2000);
            
        } catch (error) {
            this.mostrarEstadoCarga(false);
            this.mostrarMensaje('Error al programar la sesión. Por favor, intente nuevamente.', 'error');
        }
    }
    
    validarFechaHora() {
        if (!this.fechaInput || !this.horaInput) return false;
        
        const fecha = this.fechaInput.value;
        const hora = this.horaInput.value;
        
        if (!fecha || !hora) return false;
        
        // Verificar que la fecha no sea en el pasado
        const fechaHoraSeleccionada = new Date(`${fecha}T${hora}`);
        const ahora = new Date();
        
        if (fechaHoraSeleccionada < ahora) {
            this.fechaInput.classList.add('is-invalid');
            this.horaInput.classList.add('is-invalid');
            return false;
        }
        
        this.fechaInput.classList.remove('is-invalid');
        this.horaInput.classList.remove('is-invalid');
        return true;
    }
    
    async simularGuardado() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // En una implementación real, aquí se haría la submission del formulario
                // Por ahora, simulamos un 95% de éxito
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Error de simulación en el guardado'));
                }
            }, 2000);
        });
    }
    
    mostrarEstadoCarga(mostrar) {
        if (mostrar) {
            this.btnSubmit.disabled = true;
            this.btnSubmit.classList.add('btn-loading');
            this.btnSubmit.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Programando...';
        } else {
            this.btnSubmit.disabled = false;
            this.btnSubmit.classList.remove('btn-loading');
            this.btnSubmit.innerHTML = '<i class="bi bi-calendar-plus me-2"></i>Programar Sesión';
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
        // Verificar si hay cambios sin guardar
        const formData = new FormData(this.form);
        let hasChanges = false;
        
        for (let [key, value] of formData.entries()) {
            if (value && value.trim() !== '') {
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
document.addEventListener('DOMContentLoaded', function() {
    new CrearSesion();
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la vista de crear sesión:', e.error);
});