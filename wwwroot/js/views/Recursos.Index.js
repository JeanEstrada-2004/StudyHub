// View-specific scripts for Recursos/Index
// Funcionalidad específica para Lista de Recursos - StudyHub
class RecursosIndexStudyHub {
    constructor() {
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupSearchAndFilter();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Botón de actualizar recursos
        const refreshBtn = document.getElementById('refreshRecursos');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshRecursos();
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

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Trackeo de descargas y aperturas de enlaces
        this.trackResourceInteractions();
    }

    setupAnimations() {
        // Animación escalonada para los recursos
        const recursoItems = document.querySelectorAll('.recurso-item');
        recursoItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
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
            const results = document.querySelectorAll('.recurso-item:not(.hidden)').length;
            this.showToast(`${results} recursos encontrados`, 'info');
        }
    }

    applyAllFilters() {
        const recursos = document.querySelectorAll('.recurso-item');
        let visibleCount = 0;

        recursos.forEach(recurso => {
            const tipo = recurso.dataset.tipo;
            const titulo = recurso.dataset.titulo;
            const fecha = parseInt(recurso.dataset.fecha);
            
            // Aplicar filtro
            let showByFilter = this.currentFilter === 'all' || 
                             (this.currentFilter === 'archivo' && tipo === 'archivo') ||
                             (this.currentFilter === 'enlace' && tipo === 'enlace');
            
            // Aplicar búsqueda
            let showBySearch = !this.searchTerm || titulo.includes(this.searchTerm);
            
            // Mostrar/ocultar
            if (showByFilter && showBySearch) {
                recurso.classList.remove('hidden');
                visibleCount++;
            } else {
                recurso.classList.add('hidden');
            }
        });

        // Aplicar ordenamiento
        this.sortResources();

        // Actualizar contador de resultados
        this.updateResultsCount(visibleCount);
    }

    sortResources() {
        const container = document.getElementById('recursosGrid');
        const recursos = Array.from(container.querySelectorAll('.recurso-item:not(.hidden)'));

        recursos.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return parseInt(b.dataset.fecha) - parseInt(a.dataset.fecha);
                case 'oldest':
                    return parseInt(a.dataset.fecha) - parseInt(b.dataset.fecha);
                case 'title':
                    return a.dataset.titulo.localeCompare(b.dataset.titulo);
                default:
                    return 0;
            }
        });

        // Re-insertar en orden
        recursos.forEach(recurso => {
            container.appendChild(recurso);
        });
    }

    updateResultsCount(count) {
        // Podríamos actualizar un contador en la UI si lo agregamos
        console.log(`Recursos visibles: ${count}`);
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
            'all': 'Todos los recursos',
            'archivo': 'Solo archivos',
            'enlace': 'Solo enlaces'
        };
        return filterTexts[filter] || filter;
    }

    getSortText(sort) {
        const sortTexts = {
            'newest': 'Más recientes primero',
            'oldest': 'Más antiguos primero',
            'title': 'Por título (A-Z)'
        };
        return sortTexts[sort] || sort;
    }

    async refreshRecursos() {
        const refreshBtn = document.getElementById('refreshRecursos');
        
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Actualizando...';
            refreshBtn.disabled = true;
        }

        try {
            // Simular recarga (en producción sería una petición AJAX)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // En una implementación real, aquí actualizaríamos los datos via AJAX
            // Por ahora, recargamos la página
            window.location.reload();
        } catch (error) {
            console.error('Error al actualizar recursos:', error);
            this.showToast('Error al actualizar la lista de recursos', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Actualizar Lista';
                refreshBtn.disabled = false;
            }
        }
    }

    confirmDelete() {
        return confirm('¿Estás seguro de que deseas eliminar este recurso? Esta acción no se puede deshacer.');
    }

    trackResourceInteractions() {
        // Trackear descargas de archivos
        const downloadLinks = document.querySelectorAll('a[asp-action="Descargar"]');
        downloadLinks.forEach(link => {
            link.addEventListener('click', () => {
                const recursoId = link.getAttribute('href').split('/').pop();
                this.trackDownload(recursoId);
            });
        });

        // Trackear apertura de enlaces externos
        const externalLinks = document.querySelectorAll('a[target="_blank"]');
        externalLinks.forEach(link => {
            link.addEventListener('click', () => {
                const url = link.getAttribute('href');
                this.trackExternalLink(url);
            });
        });
    }

    trackDownload(recursoId) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'resource_download', {
                'event_category': 'engagement',
                'event_label': 'resource_interaction'
            });
        }
    }

    trackExternalLink(url) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'external_link_click', {
                'event_category': 'engagement',
                'event_label': url
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
        
        // Filtros rápidos con Ctrl+1, Ctrl+2, Ctrl+3
        if (e.ctrlKey && e.key >= '1' && e.key <= '3') {
            e.preventDefault();
            const filters = ['all', 'archivo', 'enlace'];
            const filterIndex = parseInt(e.key) - 1;
            if (filters[filterIndex]) {
                this.applyFilter(filters[filterIndex]);
            }
        }
        
        // Actualizar con F5
        if (e.key === 'F5') {
            e.preventDefault();
            this.refreshRecursos();
        }
    }

    analyticsTracking() {
        console.log('Vista de Recursos cargada - StudyHub Analytics');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'resources_view', {
                'event_category': 'engagement',
                'event_label': 'resources_page_loaded'
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
                    gtag('event', 'filter_used', {
                        'event_category': 'interaction',
                        'event_label': link.dataset.filter
                    });
                }
            });
        });

        // Trackear uso de ordenamiento
        const sortLinks = document.querySelectorAll('[data-sort]');
        sortLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'sort_used', {
                        'event_category': 'interaction',
                        'event_label': link.dataset.sort
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
    new RecursosIndexStudyHub();
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
    
    .recurso-item.hidden {
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
    console.error('Error en Recursos Index StudyHub:', e.error);
});