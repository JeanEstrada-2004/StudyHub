// View-specific scripts for Home/Dashboard
// Funcionalidad específica para el Dashboard de StudyHub
class DashboardStudyHub {
    constructor() {
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupAutoRefresh();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Botón de actualizar
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshDashboard();
            });
        }

        // Botón de ayuda
        const helpBtn = document.getElementById('helpDashboard');
        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHelpModal();
            });
        }

        // Centro de ayuda desde accesos rápidos
        const helpCenterBtn = document.getElementById('helpCenterBtn');
        if (helpCenterBtn) {
            helpCenterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHelpModal();
            });
        }

        // Feedback del dashboard
        const feedbackBtn = document.getElementById('dashboardFeedback');
        if (feedbackBtn) {
            feedbackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showFeedbackForm();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Intersection Observer para animaciones al hacer scroll
        this.setupScrollAnimations();
    }

    setupAnimations() {
        // Animación escalonada para las tarjetas de resumen
        const summaryCards = document.querySelectorAll('.summary-card');
        summaryCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });

        // Animación para accesos rápidos
        const quickAccessCards = document.querySelectorAll('.quick-access-card');
        quickAccessCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 300 + (index * 50));
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.transition = 'all 0.6s ease';
                }
            });
        }, observerOptions);

        // Observar elementos que queremos animar al hacer scroll
        const animatedElements = document.querySelectorAll('.card, .list-group-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    }

    setupAutoRefresh() {
        // Auto-refresh cada 5 minutos (300000 ms)
        setInterval(() => {
            if (document.visibilityState === 'visible' && !this.isLoading) {
                this.refreshDashboard(true); // true = auto-refresh
            }
        }, 300000);
    }

    async refreshDashboard(isAutoRefresh = false) {
        if (this.isLoading) return;

        this.isLoading = true;
        const refreshBtn = document.getElementById('refreshDashboard');
        
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Actualizando...';
            refreshBtn.disabled = true;
        }

        try {
            // Simular recarga de datos (en un caso real, haríamos una petición AJAX)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Recargar la página (en producción sería una actualización parcial vía AJAX)
            if (!isAutoRefresh) {
                window.location.reload();
            } else {
                console.log('Dashboard actualizado automáticamente');
            }
            
            this.showToast('Dashboard actualizado correctamente', 'success');
        } catch (error) {
            console.error('Error al actualizar dashboard:', error);
            this.showToast('Error al actualizar el dashboard', 'error');
        } finally {
            this.isLoading = false;
            if (refreshBtn && !isAutoRefresh) {
                refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Actualizar';
                refreshBtn.disabled = false;
            }
        }
    }

    showHelpModal() {
        // Crear modal de ayuda dinámicamente
        const helpModal = `
            <div class="modal fade" id="helpModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-question-circle text-primary me-2"></i>
                                Centro de Ayuda - StudyHub Dashboard
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <h6><i class="bi bi-journals me-2"></i>Gestión de Cursos</h6>
                                    <p class="small text-muted">Accede a tus cursos, crea nuevos contenidos y gestiona tus clases.</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6><i class="bi bi-calendar-week me-2"></i>Sesiones Programadas</h6>
                                    <p class="small text-muted">Revisa tus próximas sesiones y accede al calendario completo.</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6><i class="bi bi-graph-up me-2"></i>Métricas y Estadísticas</h6>
                                    <p class="small text-muted">Monitorea tu actividad y progreso en los cursos.</p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6><i class="bi bi-lightning me-2"></i>Accesos Rápidos</h6>
                                    <p class="small text-muted">Accede rápidamente a las funciones más utilizadas.</p>
                                </div>
                            </div>
                            <div class="alert alert-info mt-3">
                                <small>
                                    <i class="bi bi-info-circle me-2"></i>
                                    ¿Necesitas más ayuda? Contacta al soporte técnico desde tu perfil.
                                </small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <a href="@Url.Action("Index", "Perfil")" class="btn btn-primary">Ir a Mi Perfil</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si hay uno
        const existingModal = document.getElementById('helpModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar nuevo modal al DOM
        document.body.insertAdjacentHTML('beforeend', helpModal);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('helpModal'));
        modal.show();
    }

    showFeedbackForm() {
        // Implementación básica del formulario de feedback
        const feedbackMessage = "¿Tienes sugerencias para mejorar el Dashboard? Envíanos tus comentarios desde la sección de soporte en tu perfil.";
        this.showToast(feedbackMessage, 'info', 5000);
        
        // Redirigir a perfil después de 2 segundos
        setTimeout(() => {
            window.location.href = '@Url.Action("Index", "Perfil")' + '#soporte';
        }, 2000);
    }

    handleKeyboardShortcuts(e) {
        // Refresh con F5 o Ctrl+R
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
            this.refreshDashboard();
        }
        
        // Ayuda con F1
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHelpModal();
        }
        
        // Navegación rápida con números
        if (e.altKey && e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            this.quickNavigation(parseInt(e.key));
        }
    }

    quickNavigation(number) {
        const quickAccessLinks = document.querySelectorAll('.quick-access-card');
        if (quickAccessLinks[number - 1]) {
            quickAccessLinks[number - 1].click();
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        // Crear toast dinámicamente
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi bi-${this.getToastIcon(type)} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        // Agregar toast container si no existe
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1060';
            document.body.appendChild(toastContainer);
        }

        // Agregar toast
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        // Mostrar toast
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: duration });
        toast.show();

        // Remover toast del DOM después de ocultarse
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    analyticsTracking() {
        // Trackeo del dashboard para analytics
        console.log('Dashboard StudyHub cargado - Analytics Tracking');
        
        // Integración con Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'dashboard_view', {
                'event_category': 'engagement',
                'event_label': 'dashboard_loaded'
            });
        }

        // Trackeo de interacciones
        this.trackUserInteractions();
    }

    trackUserInteractions() {
        // Trackear clics en accesos rápidos
        const quickAccessLinks = document.querySelectorAll('.quick-access-card');
        quickAccessLinks.forEach(link => {
            link.addEventListener('click', () => {
                const title = link.querySelector('.card-title').textContent;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'quick_access_click', {
                        'event_category': 'navigation',
                        'event_label': title
                    });
                }
            });
        });
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new DashboardStudyHub();
});

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    .spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @media (prefers-reduced-motion: reduce) {
        .spin {
            animation: none;
        }
    }
`;
document.head.appendChild(style);

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en Dashboard StudyHub:', e.error);
});