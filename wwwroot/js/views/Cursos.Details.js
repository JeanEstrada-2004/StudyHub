// Funcionalidad específica para la vista de Detalle del Curso - StudyHub
class DetalleCurso {
    constructor() {
        this.cursoId = null;
        this.esProfesor = false;
        this.init();
    }
    
    init() {
        this.detectarRolUsuario();
        this.setupEventListeners();
        this.setupInteracciones();
        this.cargarInformacionAdicional();
    }
    
    detectarRolUsuario() {
        // Determinar si el usuario es profesor basado en la UI
        this.esProfesor = document.querySelector('.btn-group-vertical')?.innerHTML.includes('Gestionar Estudiantes') || false;
    }
    
    setupEventListeners() {
        // Event listeners para botones de acción rápida
        this.setupBotonesAccion();
        
        // Event listeners para elementos interactivos
        this.setupElementosInteractivos();
        
        // Configurar tooltips de Bootstrap si están disponibles
        this.setupTooltips();
    }
    
    setupBotonesAccion() {
        // Botón de exportación
        const btnExportar = document.getElementById('btnExportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportarInformacion();
            });
        }
    }
    
    setupElementosInteractivos() {
        // Hacer las tarjetas de estadísticas clickeables si es necesario
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                this.handleStatCardClick(e.currentTarget);
            });
        });
        
        // Mejorar la interactividad de las clases
        const claseItems = document.querySelectorAll('.clase-item');
        claseItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Evitar que se active cuando se hace click en un botón
                if (!e.target.closest('a, button')) {
                    const link = item.querySelector('a[asp-controller="Clases"]');
                    if (link) {
                        window.location.href = link.href;
                    }
                }
            });
        });
    }
    
    setupTooltips() {
        // Inicializar tooltips de Bootstrap si está disponible
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
        
        // Agregar tooltips personalizados para elementos sin data-bs-toggle
        this.agregarTooltipsPersonalizados();
    }
    
    agregarTooltipsPersonalizados() {
        const elementosConTooltip = [
            { selector: '.stat-card', text: 'Haga clic para navegar a esta sección' },
            { selector: '.clase-item', text: 'Haga clic para ver detalles de la clase' }
        ];
        
        elementosConTooltip.forEach(item => {
            const elementos = document.querySelectorAll(item.selector);
            elementos.forEach(el => {
                el.setAttribute('title', item.text);
                el.setAttribute('data-bs-toggle', 'tooltip');
            });
        });
        
        // Re-inicializar tooltips después de agregarlos
        this.setupTooltips();
    }
    
    setupInteracciones() {
        // Configurar cualquier interacción adicional
        this.setupCargaPerezosa();
        this.setupActualizacionesAutomaticas();
    }
    
    setupCargaPerezosa() {
        // Para futuras implementaciones de carga perezosa de imágenes o contenido
        console.log('Configurada carga perezosa para elementos del curso');
    }
    
    setupActualizacionesAutomaticas() {
        // Actualizar el contador de próxima sesión cada minuto
        setInterval(() => {
            this.actualizarProximaSesion();
        }, 60000);
    }
    
    cargarInformacionAdicional() {
        // Cargar información adicional via AJAX si es necesario
        // Por ejemplo, estadísticas en tiempo real, notificaciones, etc.
        
        if (this.esProfesor) {
            this.cargarEstadisticasAvanzadas();
        }
    }
    
    cargarEstadisticasAvanzadas() {
        // Simular carga de estadísticas avanzadas para profesores
        setTimeout(() => {
            console.log('Estadísticas avanzadas cargadas para el profesor');
        }, 1000);
    }
    
    handleStatCardClick(card) {
        const statLabel = card.querySelector('.stat-label').textContent.trim();
        
        switch(statLabel) {
            case 'Clases':
                document.querySelector('html').scrollTo({
                    top: document.querySelector('#listaClases').offsetTop - 100,
                    behavior: 'smooth'
                });
                break;
            case 'Estudiantes':
                if (this.esProfesor) {
                    const link = document.querySelector('a[asp-action="Alumnos"]');
                    if (link) window.location.href = link.href;
                }
                break;
            case 'Delegados':
                if (this.esProfesor) {
                    const link = document.querySelector('a[asp-action="Alumnos"]');
                    if (link) window.location.href = link.href;
                }
                break;
            case 'Próxima Sesión':
                const calendarioLink = document.querySelector('a[asp-action="Calendario"]');
                if (calendarioLink) window.location.href = calendarioLink.href;
                break;
        }
        
        // Efecto visual de click
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }
    
    exportarInformacion() {
        // Simular proceso de exportación
        this.mostrarMensaje('Preparando exportación del curso...', 'info');
        
        setTimeout(() => {
            const modalHTML = `
                <div class="modal fade" id="exportModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-download me-2"></i>Exportar Información del Curso
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Formato de exportación:</label>
                                    <select class="form-select" id="exportFormat">
                                        <option value="pdf">PDF Document</option>
                                        <option value="excel">Excel Spreadsheet</option>
                                        <option value="csv">CSV File</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Incluir:</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="includeClasses" checked>
                                        <label class="form-check-label" for="includeClasses">Información de clases</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="includeSessions" checked>
                                        <label class="form-check-label" for="includeSessions">Sesiones programadas</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="includeStudents" ${this.esProfesor ? '' : 'disabled'}>
                                        <label class="form-check-label" for="includeStudents">Lista de estudiantes</label>
                                        ${!this.esProfesor ? '<small class="text-muted d-block">Solo disponible para profesores</small>' : ''}
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="includeResources" checked>
                                        <label class="form-check-label" for="includeResources">Recursos y materiales</label>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" id="confirmExport">
                                    <i class="bi bi-download me-2"></i>Generar Exportación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modalElement = document.getElementById('exportModal');
            const modal = new bootstrap.Modal(modalElement);
            
            document.getElementById('confirmExport').addEventListener('click', () => {
                modal.hide();
                this.procesarExportacion();
            });
            
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            });
            
            modal.show();
        }, 1000);
    }
    
    procesarExportacion() {
        this.mostrarMensaje('Generando archivo de exportación...', 'info');
        
        // Simular generación de archivo
        setTimeout(() => {
            this.mostrarMensaje('¡Exportación completada! El archivo se ha descargado.', 'success');
            
            // En una implementación real, aquí se iniciaría la descarga
            console.log('Proceso de exportación simulado');
        }, 2000);
    }
    
    actualizarProximaSesion() {
        // En una implementación real, esto haría una llamada AJAX para actualizar
        // la información de la próxima sesión
        console.log('Actualizando información de próxima sesión...');
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
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    new DetalleCurso();
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la vista de detalle del curso:', e.error);
});