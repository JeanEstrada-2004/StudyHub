// View-specific scripts for Home/Privacy
// Funcionalidad específica para la Política de Privacidad de StudyHub
class PrivacyPolicyStudyHub {
    constructor() {
        this.currentSection = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollSpy();
        this.setupAnimations();
        this.setupPrintFunctionality();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Navegación suave para anclas
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Botón de impresión (si se añade en el futuro)
        const printBtn = document.getElementById('printPolicy');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printPolicy();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Actualizar fecha de última actualización
        this.updateLastModified();
    }

    setupScrollSpy() {
        // Observar secciones para actualizar navegación
        const sections = document.querySelectorAll('section');
        const navItems = document.querySelectorAll('.list-group-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentSection = entry.target.getAttribute('id');
                    this.updateActiveNav(currentSection);
                }
            });
        }, {
            threshold: 0.6,
            rootMargin: '-20% 0px -20% 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupAnimations() {
        // Animación escalonada para las secciones
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.6s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });

        // Animación para cards de puntos clave
        const keyPoints = document.querySelectorAll('.card.bg-light');
        keyPoints.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 300 + (index * 50));
        });
    }

    setupPrintFunctionality() {
        // Añadir botón de impresión si no existe
        if (!document.getElementById('printPolicy')) {
            const printBtn = document.createElement('button');
            printBtn.id = 'printPolicy';
            printBtn.className = 'btn btn-outline-primary btn-sm';
            printBtn.innerHTML = '<i class="bi bi-printer me-2"></i>Imprimir Política';
            
            const header = document.querySelector('.d-flex.align-items-center.mb-4');
            if (header) {
                header.appendChild(printBtn);
            }
        }
    }

    scrollToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 100; // Offset para el header fijo
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Actualizar URL sin recargar la página
            history.pushState(null, null, `#${sectionId}`);
        }
    }

    updateActiveNav(sectionId) {
        const navItems = document.querySelectorAll('.list-group-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href && href.includes(sectionId)) {
                item.classList.add('active');
            }
        });

        this.currentSection = sectionId;
    }

    printPolicy() {
        const printContent = document.querySelector('.col-lg-8').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Política de Privacidad - StudyHub</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
                <style>
                    body { padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                    .card { border: 1px solid #dee2e6; margin-bottom: 1rem; }
                    .section-icon { display: none; }
                    .sticky-top { position: relative !important; }
                    @media print {
                        .btn, .breadcrumb, .col-lg-4 { display: none !important; }
                        .col-lg-8 { width: 100% !important; }
                    }
                </style>
            </head>
            <body>
                <h1>Política de Privacidad - StudyHub</h1>
                <p><strong>Última actualización:</strong> ${new Date().toLocaleDateString()}</p>
                <hr>
                ${printContent}
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    handleKeyboardShortcuts(e) {
        // Navegación con teclado (Ctrl + número de sección)
        if (e.ctrlKey && e.key >= '1' && e.key <= '7') {
            e.preventDefault();
            const sections = ['introduccion', 'informacion-recopilada', 'uso-informacion', 
                            'comparticion', 'derechos', 'cookies', 'contacto'];
            const sectionIndex = parseInt(e.key) - 1;
            if (sections[sectionIndex]) {
                this.scrollToSection(sections[sectionIndex]);
            }
        }

        // Búsqueda con Ctrl+F
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            this.showSearch();
        }
    }

    showSearch() {
        // Implementación básica de búsqueda
        const searchTerm = prompt('Buscar en la política de privacidad:');
        if (searchTerm) {
            this.highlightText(searchTerm);
        }
    }

    highlightText(searchTerm) {
        // Remover highlights anteriores
        const existingHighlights = document.querySelectorAll('.search-highlight');
        existingHighlights.forEach(highlight => {
            highlight.outerHTML = highlight.innerHTML;
        });

        // Buscar y resaltar texto
        const content = document.querySelector('.col-lg-8');
        const regex = new RegExp(searchTerm, 'gi');
        content.innerHTML = content.innerHTML.replace(regex, match => 
            `<span class="search-highlight bg-warning">${match}</span>`
        );

        // Scroll al primer resultado
        const firstHighlight = document.querySelector('.search-highlight');
        if (firstHighlight) {
            firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateLastModified() {
        const lastModifiedEl = document.querySelector('[data-last-modified]');
        if (lastModifiedEl) {
            lastModifiedEl.textContent = new Date().toLocaleDateString();
        }
    }

    analyticsTracking() {
        // Trackeo de la página de política de privacidad
        console.log('Página de Política de Privacidad cargada - StudyHub Analytics');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'privacy_policy_view', {
                'event_category': 'engagement',
                'event_label': 'privacy_policy_loaded'
            });
        }

        // Trackeo de secciones vistas
        this.trackSectionViews();
    }

    trackSectionViews() {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.querySelector('h3')?.textContent || 'Unknown Section';
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'section_view', {
                            'event_category': 'privacy_policy',
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

    // Método para mostrar toasts de feedback
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
    new PrivacyPolicyStudyHub();
});

// Agregar estilos para búsqueda
const searchStyle = document.createElement('style');
searchStyle.textContent = `
    .search-highlight {
        background-color: #ffc107;
        padding: 0.1rem 0.2rem;
        border-radius: 3px;
        transition: background-color 0.3s ease;
    }
    
    .search-highlight.fade-out {
        background-color: transparent;
        transition: background-color 2s ease;
    }
`;
document.head.appendChild(searchStyle);

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en Política de Privacidad StudyHub:', e.error);
});