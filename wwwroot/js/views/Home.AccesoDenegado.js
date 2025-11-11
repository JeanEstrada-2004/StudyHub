// View-specific scripts for Home/AccesoDenegado
// Funcionalidad específica para la vista de Acceso Denegado - StudyHub
class AccesoDenegado {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Event listener para el botón de volver atrás
        const backButton = document.querySelector('button[onclick="history.back()"]');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBackNavigation();
            });
        }

        // Event listener para el botón del dashboard
        const dashboardButton = document.querySelector('a[href*="Dashboard"]');
        if (dashboardButton) {
            dashboardButton.addEventListener('click', (e) => {
                this.trackNavigation('dashboard_click');
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupAnimations() {
        // Animación suave para la card principal
        const card = document.querySelector('.acceso-denegado-card');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }

        // Animación escalonada para los elementos internos
        this.staggerAnimation();
    }

    staggerAnimation() {
        const elements = document.querySelectorAll('.acceso-denegado-icon, h1, .lead, .text-muted, .btn');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
        });
    }

    handleBackNavigation() {
        if (document.referrer && document.referrer.includes(window.location.host)) {
            window.history.back();
        } else {
            // Si no hay historial previo en el sitio, redirigir al dashboard
            window.location.href = '/Home/Dashboard';
        }
    }

    handleKeyboardShortcuts(e) {
        // Escape key para volver atrás
        if (e.key === 'Escape') {
            this.handleBackNavigation();
        }
        
        // Alt + D para ir al dashboard
        if (e.altKey && e.key === 'd') {
            e.preventDefault();
            window.location.href = '/Home/Dashboard';
        }
    }

    analyticsTracking() {
        // Trackeo del acceso denegado para analytics
        console.log('Acceso denegado registrado - StudyHub Analytics');
        
        // Aquí se podría integrar con Google Analytics o similar
        if (typeof gtag !== 'undefined') {
            gtag('event', 'access_denied', {
                'event_category': 'security',
                'event_label': 'acceso_denegado_pagina'
            });
        }
    }

    // Método para mostrar toast de feedback (si se necesita en el futuro)
    showToast(message, type = 'info') {
        // Implementación de toast system si es necesario
        console.log(`Toast [${type}]: ${message}`);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new AccesoDenegado();
});

// Manejo de errores global para esta vista
window.addEventListener('error', function(e) {
    console.error('Error en vista AccesoDenegado:', e.error);
});