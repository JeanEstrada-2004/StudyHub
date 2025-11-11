// View-specific scripts for Perfil/Index
// Funcionalidad específica para Mi Perfil - StudyHub
class MiPerfilStudyHub {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupStatsLoader();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Botón de centro de ayuda
        const helpBtn = document.getElementById('helpCenterBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHelpModal();
            });
        }

        // Exportar datos (placeholder)
        const exportBtn = document.querySelector('a[href="#"] .dropdown-item.text-muted');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showExportInfo();
            });
        }

        // Refresh de estadísticas
        const refreshStats = document.querySelectorAll('.stat-item .btn');
        refreshStats.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadStats();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Cargar estadísticas al hacer hover
        this.setupHoverEffects();
    }

    setupAnimations() {
        // Animación escalonada para las cards
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });

        // Animación para el header
        const header = document.querySelector('.d-flex.align-items-center.mb-5');
        if (header) {
            header.style.opacity = '0';
            header.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                header.style.transition = 'all 0.5s ease';
                header.style.opacity = '1';
                header.style.transform = 'translateX(0)';
            }, 50);
        }
    }

    setupStatsLoader() {
        // Simular carga de estadísticas (en producción sería una llamada AJAX)
        setTimeout(() => {
            this.loadStats();
        }, 1000);
    }

    setupHoverEffects() {
        // Efectos hover para elementos interactivos
        const interactiveElements = document.querySelectorAll('.info-item, .stat-item, .achievement-item');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
                element.style.transition = 'all 0.3s ease';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)';
            });
        });
    }

    loadStats() {
        // Simular carga de estadísticas reales
        const stats = {
            cursosCreados: Math.floor(Math.random() * 10) + 1,
            estudiantes: Math.floor(Math.random() * 50) + 10,
            cursosInscritos: Math.floor(Math.random() * 5) + 1,
            completados: Math.floor(Math.random() * 3),
            sesionesSemana: Math.floor(Math.random() * 5)
        };

        // Actualizar UI con las estadísticas
        this.updateStatsUI(stats);
    }

    updateStatsUI(stats) {
        // Buscar y actualizar elementos de estadísticas
        const statElements = {
            'Cursos Creados': stats.cursosCreados,
            'Estudiantes': stats.estudiantes,
            'Cursos Inscritos': stats.cursosInscritos,
            'Completados': stats.completados,
            'Sesiones Esta Semana': stats.sesionesSemana
        };

        Object.keys(statElements).forEach(statName => {
            const statValue = statElements[statName];
            const statItems = document.querySelectorAll('.stat-item');
            
            statItems.forEach(item => {
                const strongElement = item.querySelector('strong');
                if (strongElement && strongElement.textContent === '--') {
                    const labelElement = item.querySelector('.text-muted');
                    if (labelElement && labelElement.textContent.includes(statName)) {
                        strongElement.textContent = statValue;
                        
                        // Animación de conteo
                        this.animateCount(strongElement, 0, statValue, 1000);
                    }
                }
            });
        });

        // Actualizar porcentaje de completados
        const completadosElement = document.querySelector('.stat-item .text-muted.small');
        if (completadosElement && completadosElement.textContent === '0%') {
            const porcentaje = stats.cursosInscritos > 0 ? 
                Math.round((stats.completados / stats.cursosInscritos) * 100) : 0;
            completadosElement.textContent = `${porcentaje}%`;
        }
    }

    animateCount(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    showHelpModal() {
        const modalHtml = `
            <div class="modal fade" id="helpModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-question-circle text-primary me-2"></i>
                                Centro de Ayuda - Mi Perfil
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <h6><i class="bi bi-person-lines-fill me-2"></i>Gestión de Perfil</h6>
                                    <p class="small text-muted">
                                        Actualiza tu información personal, cambia tu foto de perfil y gestiona tus preferencias de privacidad.
                                    </p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6><i class="bi bi-shield-lock me-2"></i>Seguridad</h6>
                                    <p class="small text-muted">
                                        Cambia tu contraseña regularmente y revisa la actividad de tu cuenta para mantenerla segura.
                                    </p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6><i class="bi bi-graph-up me-2"></i>Estadísticas</h6>
                                    <p class="small text-muted">
                                        Monitorea tu progreso en los cursos, tu participación y tu actividad general en la plataforma.
                                    </p>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6><i class="bi bi-award me-2"></i>Logros</h6>
                                    <p class="small text-muted">
                                        Desbloquea insignias y logros según tu participación y progreso en los cursos de StudyHub.
                                    </p>
                                </div>
                            </div>
                            <div class="alert alert-info mt-3">
                                <small>
                                    <i class="bi bi-info-circle me-2"></i>
                                    ¿Necesitas ayuda específica? Contacta a nuestro equipo de soporte desde la sección de contacto en tu perfil.
                                </small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <a href="mailto:soporte@studyhub.edu" class="btn btn-primary">Contactar Soporte</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente
        const existingModal = document.getElementById('helpModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById('helpModal'));
        modal.show();
    }

    showExportInfo() {
        this.showToast('La exportación de datos estará disponible próximamente', 'info', 4000);
        
        // Simular proceso de exportación
        setTimeout(() => {
            const modalHtml = `
                <div class="modal fade" id="exportModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-download text-primary me-2"></i>
                                    Exportar Datos
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <p class="text-muted">
                                    Próximamente podrás exportar toda la información de tu cuenta de StudyHub, incluyendo:
                                </p>
                                <ul class="small text-muted">
                                    <li>Tu información personal</li>
                                    <li>Historial de cursos y progreso</li>
                                    <li>Certificados y logros</li>
                                    <li>Actividad en foros y sesiones</li>
                                </ul>
                                <div class="alert alert-warning mt-3">
                                    <small>
                                        <i class="bi bi-clock-history me-2"></i>
                                        Esta función estará disponible en la próxima actualización de la plataforma.
                                    </small>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Entendido</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remover modal existente
            const existingExportModal = document.getElementById('exportModal');
            if (existingExportModal) {
                existingExportModal.remove();
            }

            // Agregar nuevo modal
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            const modal = new bootstrap.Modal(document.getElementById('exportModal'));
            modal.show();
        }, 1000);
    }

    handleKeyboardShortcuts(e) {
        // Navegación rápida con números (Alt + número)
        if (e.altKey && e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            this.quickNavigation(parseInt(e.key));
        }
        
        // Ayuda con F1
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHelpModal();
        }
        
        // Refresh de estadísticas con F5
        if (e.key === 'F5') {
            e.preventDefault();
            this.loadStats();
        }
    }

    quickNavigation(number) {
        const quickActionLinks = document.querySelectorAll('.quick-action-card');
        if (quickActionLinks[number - 1]) {
            quickActionLinks[number - 1].click();
        }
    }

    analyticsTracking() {
        console.log('Vista de Mi Perfil cargada - StudyHub Analytics');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'profile_view', {
                'event_category': 'engagement',
                'event_label': 'profile_page_loaded'
            });
        }

        // Trackeo de interacciones
        this.trackUserInteractions();
    }

    trackUserInteractions() {
        // Trackear clics en acciones rápidas
        const quickActionLinks = document.querySelectorAll('.quick-action-card');
        quickActionLinks.forEach(link => {
            link.addEventListener('click', () => {
                const title = link.querySelector('.card-title').textContent;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'quick_action_click', {
                        'event_category': 'navigation',
                        'event_label': title
                    });
                }
            });
        });

        // Trackear visualización de secciones
        this.trackSectionViews();
    }

    trackSectionViews() {
        const sections = document.querySelectorAll('.card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.querySelector('.card-header h5')?.textContent || 'Unknown Section';
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'section_view', {
                            'event_category': 'profile',
                            'event_label': sectionName
                        });
                    }
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    showToast(message, type = 'info', duration = 3000) {
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

        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1060';
            document.body.appendChild(toastContainer);
        }

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: duration });
        toast.show();

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
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new MiPerfilStudyHub();
});

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes countUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .stat-item strong {
        animation: countUp 0.5s ease-out;
    }
    
    @media (prefers-reduced-motion: reduce) {
        .stat-item strong {
            animation: none;
        }
    }
`;
document.head.appendChild(style);

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en Mi Perfil StudyHub:', e.error);
});