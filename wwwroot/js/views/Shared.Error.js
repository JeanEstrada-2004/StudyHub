// View-specific scripts for Shared/Error
// wwwroot/js/views/Shared.Error.js
class SharedError {
    constructor() {
        this.errorCode = document.querySelector('.display-4')?.textContent.match(/\d+/)?.[0] || '500';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.animateElements();
        this.setupErrorReporting();
        this.logErrorToConsole();
    }

    setupEventListeners() {
        // Botón de reportar error
        const reportBtn = document.getElementById('btn-report-error');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => this.reportError());
        }

        // Mejorar la experiencia del acordeón
        const accordion = document.getElementById('errorAccordion');
        if (accordion) {
            accordion.addEventListener('show.bs.collapse', (e) => {
                this.onAccordionShow(e);
            });
        }

        // Prevenir envío múltiple del formulario de reporte
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.id === 'error-report-form') {
                this.handleErrorReportSubmit(e);
            }
        });

        // Botón de volver atrás con mejor manejo
        const backButton = document.querySelector('a[href="javascript:history.back()"]');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateBack();
            });
        }
    }

    animateElements() {
        // Animación escalonada para los elementos
        const elements = document.querySelectorAll('.error-icon, h1, h2, .alert, .technical-details, .btn');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }

    setupErrorReporting() {
        // Preparar el modal de reporte de error si se necesita
        this.prepareErrorReportModal();
    }

    prepareErrorReportModal() {
        // Crear modal dinámico para reportar errores
        const modalHtml = `
            <div class="modal fade" id="errorReportModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-envelope-exclamation me-2"></i>
                                Reportar Error
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="error-report-form">
                                <div class="mb-3">
                                    <label class="form-label">Descripción del problema</label>
                                    <textarea class="form-control" rows="4" placeholder="Describe qué estabas haciendo cuando ocurrió el error..." required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Tu email (opcional)</label>
                                    <input type="email" class="form-control" placeholder="tu@email.com">
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="includeDetails">
                                    <label class="form-check-label" for="includeDetails">
                                        Incluir detalles técnicos del error
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" form="error-report-form" class="btn btn-primary">
                                <i class="bi bi-send me-2"></i>Enviar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insertar el modal en el body si no existe
        if (!document.getElementById('errorReportModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    }

    reportError() {
        const modal = new bootstrap.Modal(document.getElementById('errorReportModal'));
        modal.show();
    }

    handleErrorReportSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Mostrar estado de carga
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Enviando...';
        submitBtn.disabled = true;

        // Simular envío (en un caso real, aquí iría una llamada API)
        setTimeout(() => {
            this.showToast('Reporte enviado correctamente. Gracias por tu feedback.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('errorReportModal')).hide();
            form.reset();
            
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    onAccordionShow(e) {
        // Animación adicional cuando se expande el acordeón
        const collapseElement = e.target;
        collapseElement.style.transform = 'scale(0.98)';
        setTimeout(() => {
            collapseElement.style.transform = 'scale(1)';
            collapseElement.style.transition = 'transform 0.3s ease';
        }, 300);
    }

    navigateBack() {
        // Mejor manejo del botón "Volver Atrás"
        if (document.referrer && document.referrer !== window.location.href) {
            window.history.back();
        } else {
            // Si no hay historial, redirigir al home
            window.location.href = '/';
        }
    }

    logErrorToConsole() {
        // Log informativo en consola para desarrolladores
        console.group('🚨 StudyHub - Error Details');
        console.error(`Error Code: ${this.errorCode}`);
        console.error(`Message: ${document.querySelector('.alert-error p')?.textContent || 'Unknown error'}`);
        console.error(`Timestamp: ${new Date().toISOString()}`);
        console.error(`URL: ${window.location.href}`);
        console.groupEnd();
    }

    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        
        const bgClass = type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info';
        
        toast.className = `toast align-items-center text-bg-${bgClass} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${this.getToastIcon(type)} me-2"></i>
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

    getToastIcon(type) {
        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        return icons[type] || 'bi-info-circle-fill';
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    new SharedError();
});

// Manejar errores no capturados en la página
window.addEventListener('error', function(e) {
    console.error('Error no capturado:', e.error);
});

// Mostrar información de debug en desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Modo desarrollo activo - Error debugging enabled');
}