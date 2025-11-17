// View-specific scripts for Sesiones/Calendario
// Funcionalidad específica para Calendario de Sesiones - StudyHub
class CalendarioSesionesStudyHub {
    constructor() {
        this.currentFilter = 'all';
        this.currentSort = 'date-asc';
        this.searchTerm = '';
        this.proximaSesion = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupCountdownTimer();
        this.setupMiniCalendario();
        this.setupSearchAndFilter();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Botón de actualizar calendario
        const refreshBtn = document.getElementById('refreshCalendario');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshCalendario();
            });
        }

        // Botón de vista calendario
        const viewCalendarBtn = document.getElementById('viewAsCalendar');
        if (viewCalendarBtn) {
            viewCalendarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCalendarView();
            });
        }

        // Exportar calendario
        const exportBtn = document.getElementById('exportCalendario');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportCalendario();
            });
        }

        // Sincronizar calendario
        const syncBtn = document.getElementById('sincronizarCalendario');
        if (syncBtn) {
            syncBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sincronizarCalendario();
            });
        }

        // Filtros
        const filterLinks = document.querySelectorAll('[data-filter]');
        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyFilter(link.dataset.filter);
            });
        });

        // Ordenamiento
        const sortLinks = document.querySelectorAll('[data-sort]');
        sortLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.applySort(link.dataset.sort);
            });
        });

        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applySearch();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applySearch();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.applySearch();
            });
        }

        // Confirmación de eliminación mejorada
        const deleteForms = document.querySelectorAll('form[asp-action="Delete"]');
        deleteForms.forEach(form => {
            const button = form.querySelector('button[type="submit"]');
            if (button) {
                button.addEventListener('click', (e) => {
                    if (!this.confirmDelete()) {
                        e.preventDefault();
                    }
                });
            }
        });

        // Trackeo de unión a reuniones
        this.trackMeetingJoins();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupAnimations() {
        // Animación escalonada para las sesiones
        const sesionCards = document.querySelectorAll('.sesion-card');
        sesionCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });

        // Animación para las tarjetas de resumen
        const summaryCards = document.querySelectorAll('.summary-card');
        summaryCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            }, 50 + (index * 100));
        });
    }

    setupCountdownTimer() {
        const proximaSesionCard = document.getElementById('proximaSesionCard');
        if (!proximaSesionCard) return;

        // Encontrar la próxima sesión
        const sesionesProximas = document.querySelectorAll('.sesion-card[data-estado="upcoming"]');
        if (sesionesProximas.length === 0) return;

        const primeraSesion = sesionesProximas[0];
        const rawFecha = primeraSesion.dataset.fecha;
        const epochMs = parseInt(rawFecha, 10);
        if (isNaN(epochMs)) {
            console.warn('Valor de fecha inválido en data-fecha:', rawFecha);
            return;
        }
        const fechaSesion = new Date(epochMs);
        
        this.proximaSesion = {
            element: primeraSesion,
            fecha: fechaSesion
        };

        // Iniciar contador regresivo
        this.updateCountdown();
        setInterval(() => {
            this.updateCountdown();
        }, 60000); // Actualizar cada minuto
    }

    updateCountdown() {
        if (!this.proximaSesion) return;

        const now = new Date();
        const diff = this.proximaSesion.fecha - now;

        if (diff <= 0) {
            // La sesión ya comenzó
            document.getElementById('countdownTimer').innerHTML = `
                <div class="text-center">
                    <i class="bi bi-play-circle-fill text-success me-2"></i>
                    <strong>La sesión ha comenzado</strong>
                </div>
            `;
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('countdownDays').textContent = days.toString().padStart(2, '0');
        document.getElementById('countdownHours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('countdownMinutes').textContent = minutes.toString().padStart(2, '0');
    }

    setupMiniCalendario() {
        const miniCalendario = document.getElementById('miniCalendario');
        if (!miniCalendario) return;

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        // Generar calendario simple para el mes actual
        this.renderMiniCalendario(miniCalendario, month, year);
    }

    renderMiniCalendario(container, month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        let html = `
            <div class="calendar-header">
                <button class="btn btn-sm btn-outline-secondary" id="prevMonth">
                    <i class="bi bi-chevron-left"></i>
                </button>
                <strong>${monthNames[month]} ${year}</strong>
                <button class="btn btn-sm btn-outline-secondary" id="nextMonth">
                    <i class="bi bi-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-grid">
        `;

        // Días de la semana
        dayNames.forEach(day => {
            html += `<div class="calendar-day text-muted small fw-bold">${day}</div>`;
        });

        // Días vacíos al inicio
        for (let i = 0; i < startingDay; i++) {
            html += '<div class="calendar-day"></div>';
        }

        // Días del mes
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = today.getDate() === day && 
                           today.getMonth() === month && 
                           today.getFullYear() === year;
            const hasEvents = this.hasEventsOnDate(day, month, year);
            
            const dayClass = `calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`;
            html += `<div class="${dayClass}">${day}</div>`;
        }

        html += '</div>';
        container.innerHTML = html;

        // Event listeners para navegación del calendario
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.navigateMiniCalendario(-1);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.navigateMiniCalendario(1);
        });
    }

    hasEventsOnDate(day, month, year) {
        // Verificar si hay sesiones en esta fecha
        const sesiones = document.querySelectorAll('.sesion-card');
        const targetDate = new Date(year, month, day);
        
        for (let sesion of sesiones) {
            const sesionDate = new Date(parseInt(sesion.dataset.fecha));
            if (sesionDate.toDateString() === targetDate.toDateString()) {
                return true;
            }
        }
        return false;
    }

    navigateMiniCalendario(direction) {
        // Navegar entre meses (simulado)
        this.showToast('Navegación de calendario disponible en la versión completa', 'info');
    }

    setupSearchAndFilter() {
        // Inicializar el estado actual
        this.updateUIState();
    }

    applyFilter(filter) {
        if (this.currentFilter === filter) return;
        
        this.currentFilter = filter;
        this.updateUIState();
        this.applyAllFilters();
        
        this.showToast(`Filtro aplicado: ${this.getFilterText(filter)}`, 'info');
    }

    applySort(sort) {
        if (this.currentSort === sort) return;
        
        this.currentSort = sort;
        this.updateUIState();
        this.applyAllFilters();
        
        this.showToast(`Ordenado por: ${this.getSortText(sort)}`, 'info');
    }

    applySearch() {
        this.applyAllFilters();
        
        if (this.searchTerm) {
            const results = document.querySelectorAll('.sesion-card:not(.hidden)').length;
            this.showToast(`${results} sesiones encontradas`, 'info');
        }
    }

    applyAllFilters() {
        const sesiones = document.querySelectorAll('.sesion-card');
        let visibleCount = 0;

        sesiones.forEach(sesion => {
            const estado = sesion.dataset.estado;
            const hoy = sesion.dataset.hoy;
            const titulo = sesion.dataset.titulo;
            const curso = sesion.dataset.curso;
            const fecha = parseInt(sesion.dataset.fecha);
            
            // Aplicar filtro
            let showByFilter = this.currentFilter === 'all' || 
                             (this.currentFilter === 'upcoming' && estado === 'upcoming') ||
                             (this.currentFilter === 'past' && estado === 'past') ||
                             (this.currentFilter === 'today' && hoy === 'today');
            
            // Aplicar búsqueda
            let showBySearch = !this.searchTerm || 
                             titulo.includes(this.searchTerm) || 
                             curso.includes(this.searchTerm);
            
            // Mostrar/ocultar
            if (showByFilter && showBySearch) {
                sesion.classList.remove('hidden');
                visibleCount++;
            } else {
                sesion.classList.add('hidden');
            }
        });

        // Aplicar ordenamiento
        this.sortSesiones();

        // Actualizar contador de resultados
        this.updateResultsCount(visibleCount);
    }

    sortSesiones() {
        const container = document.getElementById('sesionesList');
        const sesiones = Array.from(container.querySelectorAll('.sesion-card:not(.hidden)'));

        sesiones.sort((a, b) => {
            const aFecha = parseInt(a.dataset.fecha, 10);
            const bFecha = parseInt(b.dataset.fecha, 10);
            const aTitulo = a.dataset.titulo;
            const bTitulo = b.dataset.titulo;
            const aCurso = a.dataset.curso;
            const bCurso = b.dataset.curso;

            switch (this.currentSort) {
                case 'date-asc':
                    return aFecha - bFecha;
                case 'date-desc':
                    return bFecha - aFecha;
                case 'title':
                    return aTitulo.localeCompare(bTitulo);
                case 'course':
                    return aCurso.localeCompare(bCurso);
                default:
                    return aFecha - bFecha;
            }
        });

        // Re-insertar en orden
        sesiones.forEach(sesion => {
            container.appendChild(sesion);
        });
    }

    updateResultsCount(count) {
        console.log(`Sesiones visibles: ${count}`);
    }

    updateUIState() {
        // Actualizar estado activo de filtros
        const filterLinks = document.querySelectorAll('[data-filter]');
        filterLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.filter === this.currentFilter);
        });

        // Actualizar estado activo de ordenamientos
        const sortLinks = document.querySelectorAll('[data-sort]');
        sortLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.sort === this.currentSort);
        });
    }

    getFilterText(filter) {
        const filterTexts = {
            'all': 'Todas las sesiones',
            'upcoming': 'Próximas sesiones',
            'past': 'Sesiones pasadas',
            'today': 'Hoy'
        };
        return filterTexts[filter] || filter;
    }

    getSortText(sort) {
        const sortTexts = {
            'date-asc': 'Fecha (próximas primero)',
            'date-desc': 'Fecha (recientes primero)',
            'title': 'Por título',
            'course': 'Por curso'
        };
        return sortTexts[sort] || sort;
    }

    async refreshCalendario() {
        const refreshBtn = document.getElementById('refreshCalendario');
        
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Actualizando...';
            refreshBtn.disabled = true;
        }

        try {
            // Simular recarga
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload();
        } catch (error) {
            console.error('Error al actualizar calendario:', error);
            this.showToast('Error al actualizar el calendario', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Actualizar';
                refreshBtn.disabled = false;
            }
        }
    }

    showCalendarView() {
        this.showToast('Vista de calendario disponible en la versión premium', 'info');
    }

    exportCalendario() {
        this.showToast('Exportando calendario...', 'info');
        
        // Simular exportación
        setTimeout(() => {
            this.showToast('Calendario exportado correctamente', 'success');
        }, 2000);
    }

    sincronizarCalendario() {
        this.showToast('Sincronizando con calendario externo...', 'info');
        
        // Simular sincronización
        setTimeout(() => {
            this.showToast('Calendario sincronizado correctamente', 'success');
        }, 2000);
    }

    confirmDelete() {
        return confirm('¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.');
    }

    trackMeetingJoins() {
        const meetingLinks = document.querySelectorAll('a[target="_blank"][href*="://"]');
        meetingLinks.forEach(link => {
            if (link.textContent.includes('Unirse')) {
                link.addEventListener('click', () => {
                    const sesionCard = link.closest('.sesion-card');
                    const sesionId = sesionCard?.dataset.sesionId;
                    this.trackMeetingJoin(sesionId);
                });
            }
        });
    }

    trackMeetingJoin(sesionId) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'meeting_join', {
                'event_category': 'engagement',
                'event_label': 'session_interaction'
            });
        }
    }

    handleKeyboardShortcuts(e) {
        // Búsqueda con Ctrl+F
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Filtros rápidos con Ctrl+1, Ctrl+2, Ctrl+3, Ctrl+4
        if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const filters = ['all', 'upcoming', 'past', 'today'];
            const filterIndex = parseInt(e.key) - 1;
            if (filters[filterIndex]) {
                this.applyFilter(filters[filterIndex]);
            }
        }
        
        // Actualizar con F5
        if (e.key === 'F5') {
            e.preventDefault();
            this.refreshCalendario();
        }
    }

    analyticsTracking() {
        console.log('Vista de Calendario de Sesiones cargada - StudyHub Analytics');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calendar_view', {
                'event_category': 'engagement',
                'event_label': 'calendar_page_loaded'
            });
        }

        // Trackeo de interacciones
        this.trackUserInteractions();
    }

    trackUserInteractions() {
        // Trackear uso de filtros
        const filterLinks = document.querySelectorAll('[data-filter]');
        filterLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'calendar_filter_used', {
                        'event_category': 'interaction',
                        'event_label': link.dataset.filter
                    });
                }
            });
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
    new CalendarioSesionesStudyHub();
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
    
    .sesion-card.hidden {
        display: none;
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
    console.error('Error en Calendario de Sesiones StudyHub:', e.error);
});
