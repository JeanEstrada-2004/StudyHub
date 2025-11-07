// View-specific scripts for Clases/Index
// Clases.Index.js - Funcionalidad específica para la vista de listado de clases

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const filterToggle = document.getElementById('filterToggle');
    const filtersCard = document.getElementById('filtersCard');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const sortSelect = document.getElementById('sortSelect');
    const classesGrid = document.getElementById('classesGrid');
    const noResultsCard = document.getElementById('noResultsCard');
    const resetFilters = document.getElementById('resetFilters');
    const classCards = document.querySelectorAll('.class-card');
    const actionToast = document.getElementById('actionToast');
    const toastMessage = document.getElementById('toastMessage');

    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Toggle de filtros
    if (filterToggle && filtersCard) {
        filterToggle.addEventListener('click', function() {
            filtersCard.classList.toggle('d-none');
            const icon = this.querySelector('i');
            if (filtersCard.classList.contains('d-none')) {
                icon.classList.remove('bi-funnel-fill');
                icon.classList.add('bi-funnel');
            } else {
                icon.classList.remove('bi-funnel');
                icon.classList.add('bi-funnel-fill');
            }
        });
    }

    // Función para filtrar clases
    function filterClasses() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusValue = statusFilter ? statusFilter.value : '';
        const sortValue = sortSelect ? sortSelect.value : 'newest';
        
        let visibleCount = 0;
        let classArray = [];

        // Recopilar y filtrar clases
        classCards.forEach(card => {
            const title = card.querySelector('.class-title').textContent.toLowerCase();
            const course = card.querySelector('.class-course').textContent.toLowerCase();
            const isActive = true; // En una implementación real, esto vendría del modelo
            
            let shouldShow = true;

            // Aplicar filtro de búsqueda
            if (searchTerm && !title.includes(searchTerm) && !course.includes(searchTerm)) {
                shouldShow = false;
            }

            // Aplicar filtro de estado (simulado)
            if (statusValue === 'active' && !isActive) {
                shouldShow = false;
            } else if (statusValue === 'inactive' && isActive) {
                shouldShow = false;
            }

            if (shouldShow) {
                card.style.display = 'block';
                visibleCount++;
                classArray.push({
                    element: card,
                    title: title,
                    date: card.getAttribute('data-created') || ''
                });
            } else {
                card.style.display = 'none';
            }
        });

        // Ordenar clases
        sortClasses(classArray, sortValue);

        // Mostrar/ocultar estado sin resultados
        if (noResultsCard) {
            if (visibleCount === 0) {
                noResultsCard.classList.remove('d-none');
                if (classesGrid) classesGrid.classList.add('d-none');
            } else {
                noResultsCard.classList.add('d-none');
                if (classesGrid) classesGrid.classList.remove('d-none');
                
                // Reordenar en el DOM
                const gridContainer = classesGrid;
                classArray.forEach(item => {
                    gridContainer.appendChild(item.element);
                });
            }
        }

        // Animación de resultados
        animateResults();
    }

    // Función para ordenar clases
    function sortClasses(classArray, sortBy) {
        switch (sortBy) {
            case 'title':
                classArray.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'oldest':
                classArray.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'newest':
            default:
                classArray.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
    }

    // Animación para resultados filtrados
    function animateResults() {
        const visibleCards = document.querySelectorAll('.class-card[style="display: block"]');
        visibleCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in-up');
        });
    }

    // Event listeners para filtros
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterClasses, 300));
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterClasses);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', filterClasses);
    }

    // Reset de filtros
    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (sortSelect) sortSelect.value = 'newest';
            filterClasses();
        });
    }

    // Función debounce para búsqueda
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Manejar acciones de eliminación
    const deleteLinks = document.querySelectorAll('a[asp-action="Delete"]');
    deleteLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!confirm('¿Estás seguro de que quieres eliminar esta clase? Esta acción no se puede deshacer.')) {
                e.preventDefault();
            } else {
                showToast('Clase eliminada correctamente', 'success');
            }
        });
    });

    // Función para mostrar toasts
    function showToast(message, type = 'success') {
        if (actionToast && toastMessage) {
            const toastHeader = actionToast.querySelector('.toast-header i');
            
            // Configurar según el tipo
            if (type === 'success') {
                toastHeader.className = 'bi bi-check-circle text-success me-2';
                actionToast.querySelector('.me-auto').textContent = 'Éxito';
            } else if (type === 'error') {
                toastHeader.className = 'bi bi-x-circle text-danger me-2';
                actionToast.querySelector('.me-auto').textContent = 'Error';
            }
            
            toastMessage.textContent = message;
            const toast = new bootstrap.Toast(actionToast);
            toast.show();
        }
    }

    // Simular datos de última actividad (en una implementación real esto vendría del backend)
    function updateActivityTimestamps() {
        const activityBadges = document.querySelectorAll('.class-badges .bg-light');
        const now = new Date();
        const hours = now.getHours();
        
        activityBadges.forEach(badge => {
            const random = Math.random();
            let activityText = 'Última actividad: ';
            
            if (random < 0.3) {
                activityText += 'Hoy';
            } else if (random < 0.6) {
                activityText += 'Ayer';
            } else {
                activityText += 'Esta semana';
            }
            
            badge.innerHTML = `<i class="bi bi-clock me-1"></i>${activityText}`;
        });
    }

    // Inicializar la vista
    function initializeView() {
        updateActivityTimestamps();
        filterClasses(); // Aplicar filtros iniciales si los hay
        
        // Mostrar toast de bienvenida si es la primera visita
        const hasVisited = sessionStorage.getItem('classesVisited');
        if (!hasVisited) {
            setTimeout(() => {
                showToast('Bienvenido a tus clases', 'success');
                sessionStorage.setItem('classesVisited', 'true');
            }, 1000);
        }
    }

    // Inicializar
    initializeView();
});