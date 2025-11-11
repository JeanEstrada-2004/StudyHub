// Funcionalidad específica para la vista de Editar Curso - StudyHub
class EditarCurso {
    constructor() {
        this.form = null;
        this.descripcion = null;
        this.contadorDescripcion = null;
        this.btnSubmit = null;
        this.cambiosRealizados = false;
        this.valoresOriginales = {};
        this.init();
    }
    
    init() {
        this.obtenerElementos();
        this.guardarValoresOriginales();
        this.setupEventListeners();
        this.setupValidacion();
        this.setupDescripcionContador();
    }
    
    obtenerElementos() {
        this.form = document.getElementById('cursoForm');
        this.descripcion = document.getElementById('Descripcion');
        this.contadorDescripcion = document.getElementById('contadorDescripcion');
        this.btnSubmit = document.getElementById('btnSubmit');
    }
    
    guardarValoresOriginales() {
        if (this.form) {
            const formData = new FormData(this.form);
            for (let [key, value] of formData.entries()) {
                this.valoresOriginales[key] = value;
            }
        }
    }
    
    setupEventListeners() {
        // Validación en tiempo real
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            
            // Detectar cambios en los campos
            const campos = this.form.querySelectorAll('input, textarea, select');
            campos.forEach(campo => {
                campo.addEventListener('input', this.detectarCambios.bind(this));
                campo.addEventListener('change', this.detectarCambios.bind(this));
            });
        }
        
        // Contador de descripción
        if (this.descripcion) {
            this.descripcion.addEventListener('input', this.actualizarContadorDescripcion.bind(this));
        }
        
        // Upload de imagen
        this.setupImageUpload();
        
        // Validación de campos
        this.setupValidacionEnTiempoReal();
        
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
    
    actualizarContadorDescripcion() {
        const longitud = this.descripcion.value.length;
        const maxLength = 500;
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
    
    setupImageUpload() {
        const uploadPlaceholder = document.querySelector('.image-upload-placeholder');
        const fileInput = document.getElementById('imagenCurso');
        
        if (uploadPlaceholder && fileInput) {
            // Click en el placeholder
            uploadPlaceholder.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Cambio en el input file
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.mostrarVistaPreviaImagen(e.target.files[0]);
                    this.detectarCambios();
                }
            });
            
            // Drag and drop
            uploadPlaceholder.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadPlaceholder.classList.add('dragover');
            });
            
            uploadPlaceholder.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadPlaceholder.classList.remove('dragover');
            });
            
            uploadPlaceholder.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadPlaceholder.classList.remove('dragover');
                
                if (e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    this.mostrarVistaPreviaImagen(e.dataTransfer.files[0]);
                    this.detectarCambios();
                }
            });
        }
    }
    
    mostrarVistaPreviaImagen(file) {
        if (!file.type.startsWith('image/')) {
            this.mostrarMensaje('Por favor, seleccione un archivo de imagen válido.', 'error');
            return;
        }
        
        const reader = new FileReader();
        const uploadPlaceholder = document.querySelector('.image-upload-placeholder');
        
        reader.onload = (e) => {
            uploadPlaceholder.innerHTML = `
                <img src="${e.target.result}" class="img-fluid rounded" style="max-height: 120px;" alt="Vista previa">
                <p class="small text-muted mt-2">Haga clic para cambiar la imagen</p>
            `;
            
            // Re-agregar event listeners después de cambiar el contenido
            this.setupImageUpload();
        };
        
        reader.readAsDataURL(file);
    }
    
    setupValidacionEnTiempoReal() {
        const campos = this.form.querySelectorAll('input[required], textarea[required], select[required]');
        
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
    
    validarCampo(campo) {
        if (campo.checkValidity()) {
            campo.classList.remove('is-invalid');
            campo.classList.add('is-valid');
        } else {
            campo.classList.remove('is-valid');
            campo.classList.add('is-invalid');
        }
    }
    
    detectarCambios() {
        const formData = new FormData(this.form);
        let hayCambios = false;
        
        for (let [key, value] of formData.entries()) {
            if (this.valoresOriginales[key] !== value) {
                hayCambios = true;
                break;
            }
        }
        
        this.cambiosRealizados = hayCambios;
        
        // Actualizar UI si hay cambios
        this.actualizarUIcambios();
    }
    
    actualizarUIcambios() {
        if (this.cambiosRealizados) {
            document.title = document.title.replace(/^(\* )?/, '* ');
            this.btnSubmit.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Cambios *';
        } else {
            document.title = document.title.replace(/^\* /, '');
            this.btnSubmit.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Cambios';
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.form.checkValidity()) {
            this.form.classList.add('was-validated');
            this.mostrarMensaje('Por favor, complete todos los campos requeridos correctamente.', 'error');
            return;
        }
        
        // Verificar si hay cambios reales
        if (!this.cambiosRealizados) {
            const continuar = await this.mostrarConfirmacionSinCambios();
            if (!continuar) {
                return;
            }
        }
        
        // Mostrar estado de carga
        this.mostrarEstadoCarga(true);
        
        try {
            // Simular procesamiento (en producción, esto sería la submission real)
            await this.simularGuardado();
            
            // Éxito
            this.mostrarMensaje('¡Cambios guardados exitosamente!', 'success');
            this.cambiosRealizados = false;
            this.actualizarUIcambios();
            
            // Actualizar valores originales
            this.guardarValoresOriginales();
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                window.location.href = this.form.getAttribute('action').replace('Edit', 'Details');
            }, 1500);
            
        } catch (error) {
            this.mostrarEstadoCarga(false);
            this.mostrarMensaje('Error al guardar los cambios. Por favor, intente nuevamente.', 'error');
        }
    }
    
    async mostrarConfirmacionSinCambios() {
        return new Promise((resolve) => {
            const modalHTML = `
                <div class="modal fade" id="sinCambiosModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-info-circle me-2 text-info"></i>
                                    Sin Cambios Detectados
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body text-center">
                                <i class="bi bi-check-circle display-4 text-muted mb-3"></i>
                                <p>No se detectaron cambios en la información del curso.</p>
                                <p class="text-muted small">¿Desea continuar de todos modos?</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" id="confirmSinCambios">
                                    <i class="bi bi-check me-2"></i>Continuar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modalElement = document.getElementById('sinCambiosModal');
            const modal = new bootstrap.Modal(modalElement);
            
            document.getElementById('confirmSinCambios').addEventListener('click', () => {
                modal.hide();
                resolve(true);
            });
            
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
                resolve(false);
            });
            
            modal.show();
        });
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
            }, 1500);
        });
    }
    
    mostrarEstadoCarga(mostrar) {
        if (mostrar) {
            this.btnSubmit.disabled = true;
            this.btnSubmit.classList.add('btn-loading');
            this.btnSubmit.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Guardando...';
        } else {
            this.btnSubmit.disabled = false;
            this.btnSubmit.classList.remove('btn-loading');
            this.actualizarUIcambios();
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
        if (this.cambiosRealizados) {
            e.preventDefault();
            e.returnValue = 'Tiene cambios sin guardar. ¿Está seguro de que desea salir?';
            return e.returnValue;
        }
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    new EditarCurso();
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la vista de editar curso:', e.error);
});