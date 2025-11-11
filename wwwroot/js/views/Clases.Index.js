// wwwroot/js/views/Clases.Index.js
class ClasesIndex {
    constructor() {
        this.gridView = document.getElementById('gridView');
        this.tableView = document.getElementById('tableView');
        this.gridViewToggle = document.getElementById('gridViewToggle');
        this.searchInput = document.getElementById('searchInput');
        this.courseFilter = document.getElementById('courseFilter');
        this.sortFilter = document.getElementById('sortFilter');
        this.clearSearch = document.getElementById('clearSearch');
        this.resultsCount = document.getElementById('resultsCount');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFilters();
        this.updateResultsCount();
    }

    setupEventListeners() {
        // Toggle entre vista de cuadrícula y tabla
        if (this.gridViewToggle) {
            this.gridViewToggle.addEventListener('change', (e) => {
                this.toggleView(e.target.checked);
            });
        }

        // Búsqueda en tiempo real
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.filterClases();
                this.toggleClearSearchButton();
            });
        }

        // Limpiar búsqueda
        if (this.clearSearch) {
            this.clearSearch.addEventListener('click', () => {
                this.searchInput.value = '';
                this.filterClases();
                this.toggleClearSearchButton();
                this.searchInput.focus();
            });
        }

        // Filtros
        if (this.courseFilter) {
            this.courseFilter.addEventListener('change', () => {
                this.filterClases();
            });
        }

        if (this.sortFilter) {
            this.sortFilter.addEventListener('change', () => {
                this.sortClases();
            });
        }

        // Manejar tecla Escape para limpiar búsqueda
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchInput) {
                this.searchInput.value = '';
                this.filterClases();
                this.toggleClearSearchButton();
            }
        });
    }

    setupFilters() {
        // Inicializar estado del botón de limpiar búsqueda
        this.toggleClearSearchButton();
    }

    toggleView(isGridView) {
        if (isGridView) {
            this.gridView.classList.remove('d-none');
            this.tableView.classList.add('d-none');
        } else {
            this.gridView.classList.add('d-none');
            this.tableView.classList.remove('d-none');
        }
        this.updateResultsCount();
    }

    filterClases() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const courseFilter = this.courseFilter.value.toLowerCase();
        
        const claseCards = document.querySelectorAll('.clase-card, .clase-row');
        let visibleCount = 0;

        claseCards.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const course = card.getAttribute('data-course') || '';
            
            const matchesSearch = title.includes(searchTerm) || 
                                course.includes(searchTerm);
            const matchesCourse = !courseFilter || course.includes(courseFilter);
            
            if (matchesSearch && matchesCourse) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        this.updateResultsCount(visibleCount);
    }

    sortClases() {
        const sortBy = this.sortFilter.value;
        const container = this.gridView;
        const cards = Array.from(container.querySelectorAll('.clase-card'));

        cards.sort((a, b) => {
            const titleA = a.querySelector('.card-title').textContent.toLowerCase();
            const titleB = b.querySelector('.card-title').textContent.toLowerCase();
            const dateA = new Date(a.querySelector('.badge.bg-light')?.textContent || 0);
            const dateB = new Date(b.querySelector('.badge.bg-light')?.textContent || 0);

            switch (sortBy) {
                case 'newest':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'title':
                    return titleA.localeCompare(titleB);
                default:
                    return 0;
            }
        });

        // Reordenar las cards
        cards.forEach(card => container.appendChild(card));
    }

    toggleClearSearchButton() {
        if (this.clearSearch && this.searchInput) {
            if (this.searchInput.value.trim() !== '') {
                this.clearSearch.classList.remove('d-none');
            } else {
                this.clearSearch.classList.add('d-none');
            }
        }
    }

    updateResultsCount(count = null) {
        if (!this.resultsCount) return;

        const totalCount = document.querySelectorAll('.clase-card, .clase-row').length;
        const visibleCount = count !== null ? count : 
            document.querySelectorAll('.clase-card:not(.hidden), .clase-row:not(.hidden)').length;

        if (visibleCount === 0) {
            this.resultsCount.textContent = 'No se encontraron clases';
        } else if (visibleCount === totalCount) {
            this.resultsCount.textContent = 
                `${totalCount} clase${totalCount !== 1 ? 's' : ''} encontrada${totalCount !== 1 ? 's' : ''}`;
        } else {
            this.resultsCount.textContent = 
                `${visibleCount} de ${totalCount} clase${totalCount !== 1 ? 's' : ''} encontrada${visibleCount !== 1 ? 's' : ''}`;
        }
    }

    // Método para mostrar notificaciones
    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        
        const bgClass = type === 'success' ? 'success' : 
                       type === 'error' ? 'danger' : 'info';
        
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

    // Método para limpiar recursos
    destroy() {
        // Limpiar event listeners si es necesario
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.filterClases);
        }
        if (this.gridViewToggle) {
            this.gridViewToggle.removeEventListener('change', this.toggleView);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.clasesIndex = new ClasesIndex();
});

// Manejar mensajes de TempData si existen
document.addEventListener('DOMContentLoaded', function() {
    const tempDataMessage = document.querySelector('[data-tempdata-message]');
    if (tempDataMessage) {
        const message = tempDataMessage.getAttribute('data-tempdata-message');
        const type = tempDataMessage.getAttribute('data-tempdata-type') || 'success';
        
        if (window.clasesIndex && message) {
            window.clasesIndex.showToast(message, type);
        }
    }
});