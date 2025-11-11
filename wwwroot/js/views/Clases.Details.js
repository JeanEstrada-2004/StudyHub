// View-specific scripts for Clases/Details
// Clases.Details.js - Funcionalidad para la vista de detalles de clase
class ClasesDetails {
    constructor() {
        this.toast = document.getElementById('classDetailsToast');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadClassStatistics();
        this.setupInteractiveElements();
        this.animateElements();
    }

    setupEventListeners() {
        // Smooth scroll para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Efectos hover para tarjetas de acción
        const actionCards = document.querySelectorAll('.btn-action-card');
        actionCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.enhanceCardHover(card));
            card.addEventListener('mouseleave', () => this.resetCardHover(card));
        });

        // Click en estadísticas para mostrar más detalles
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.addEventListener('click', () => this.showStatDetails(item));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    setupInteractiveElements() {
        // Inicializar tooltips de Bootstrap si están disponibles
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }

        // Marcar elemento activo en breadcrumb
        this.highlightActiveBreadcrumb();
    }

    async loadClassStatistics() {
        try {
            // Simular carga de estadísticas (en producción sería una llamada API)
            await this.simulateStatisticsLoad();
            
            // Actualizar contadores
            this.updateStatCounter('resourcesCount', 12);
            this.updateStatCounter('messagesCount', 8);
            this.updateStatCounter('studentsCount', 24);
            
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.showToast('Error al cargar las estadísticas', 'error');
        }
    }

    simulateStatisticsLoad() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    updateStatCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let current = 0;
        const increment = targetValue / 30;
        const duration = 1000;

        const updateCounter = () => {
            if (current < targetValue) {
                current += increment;
                element.textContent = Math.ceil(current);
                setTimeout(updateCounter, duration / 30);
            } else {
                element.textContent = targetValue;
            }
        };

        updateCounter();
    }

    enhanceCardHover(card) {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 12px 30px rgba(13, 110, 253, 0.2)';
        
        const icon = card.querySelector('.action-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1)';
        }
    }

    resetCardHover(card) {
        card.style.transform = '';
        card.style.boxShadow = '';
        
        const icon = card.querySelector('.action-icon');
        if (icon) {
            icon.style.transform = '';
        }
    }

    showStatDetails(statItem) {
        const statType = statItem.querySelector('.stat-label').textContent.toLowerCase();
        let message = '';
        
        switch(statType) {
            case 'recursos':
                message = '12 recursos disponibles para esta clase';
                break;
            case 'mensajes':
                message = '8 mensajes en el foro de discusión';
                break;
            case 'estudiantes':
                message = '24 estudiantes inscritos en esta clase';
                break;
            default:
                message = `Información detallada de ${statType}`;
        }
        
        this.showToast(message, 'info');
    }

    highlightActiveBreadcrumb() {
        const breadcrumbs = document.querySelectorAll('.breadcrumb-item');
        breadcrumbs.forEach(item => {
            if (item.classList.contains('active')) {
                item.style.fontWeight = '600';
                item.style.color = '#2c3e50';
            }
        });
    }

    showToast(message, type = 'info') {
        const toastMessage = document.getElementById('toastMessage');
        if (!toastMessage || !this.toast) return;

        toastMessage.textContent = message;
        
        // Configurar estilo según el tipo
        const toastHeader = this.toast.querySelector('.toast-header i');
        toastHeader.className = 'bi me-2';
        
        switch (type) {
            case 'error':
                toastHeader.classList.add('bi-exclamation-triangle-fill', 'text-danger');
                break;
            case 'success':
                toastHeader.classList.add('bi-check-circle-fill', 'text-success');
                break;
            case 'warning':
                toastHeader.classList.add('bi-exclamation-triangle-fill', 'text-warning');
                break;
            default:
                toastHeader.classList.add('bi-info-circle', 'text-primary');
        }

        const bsToast = new bootstrap.Toast(this.toast);
        bsToast.show();
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }

    animateElements() {
        // Animación para elementos de detalle
        const detailItems = document.querySelectorAll('.detail-item');
        detailItems.forEach((item, index) => {
            item.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
        });

        // Animación para tarjetas de acción
        const actionCards = document.querySelectorAll('.btn-action-card');
        actionCards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1 + 0.3}s both`;
        });
    }

    // Método para actualizar estadísticas en tiempo real
    refreshStatistics() {
        this.loadClassStatistics();
    }

    // Método para limpiar recursos
    destroy() {
        // Limpiar event listeners si es necesario
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.clasesDetails = new ClasesDetails();
});

// Manejar el evento beforeunload para limpiar
window.addEventListener('beforeunload', function() {
    if (window.clasesDetails) {
        window.clasesDetails.destroy();
    }
});

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClasesDetails;
}