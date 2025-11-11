// Home.Index.js - Funcionalidad para la página de inicio de StudyHub
class StudyHubHome {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.animateCounters();
        this.setupScrollEffects();
        this.setupTypeWriter();
        this.showWelcomeToast();
        this.setupImageLoading();
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

        // Cerrar toast con Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideWelcomeToast();
            }
        });
    }

    setupImageLoading() {
        // Precargar la imagen del banner para mejor experiencia
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.addEventListener('load', () => {
                heroImage.classList.add('loaded');
            });
            
            // Fallback si la imagen no carga
            heroImage.addEventListener('error', () => {
                console.warn('No se pudo cargar la imagen del banner');
                heroImage.style.display = 'none';
                const container = document.querySelector('.hero-image-container');
                if (container) {
                    container.innerHTML = `
                        <div class="feature-icon" style="width: 120px; height: 120px; font-size: 3rem;">
                            <i class="bi bi-mortarboard"></i>
                        </div>
                    `;
                }
            });
        }
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 200;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const increment = target / speed;
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current) + 
                        (counter.textContent.includes('+') ? '+' : 
                         counter.textContent.includes('%') ? '%' : '');
                    setTimeout(updateCounter, 1);
                } else {
                    counter.textContent = target + 
                        (counter.textContent.includes('+') ? '+' : 
                         counter.textContent.includes('%') ? '%' : '');
                }
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    setupScrollEffects() {
        // Eliminado el efecto parallax que movía el hero section
        
        // Animación de elementos al hacer scroll
        this.animateOnScroll();
        
        // Intersection Observer para animaciones
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);

        // Observar todas las feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            observer.observe(card);
        });
    }

    animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card');
        const windowHeight = window.innerHeight;

        elements.forEach(element => {
            const position = element.getBoundingClientRect().top;

            if (position < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    setupTypeWriter() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid white';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                heroTitle.style.borderRight = 'none';
            }
        };
        
        // Iniciar efecto de escritura después de un breve delay
        setTimeout(typeWriter, 500);
    }

    showWelcomeToast() {
        setTimeout(() => {
            if (!sessionStorage.getItem('studyhub_welcome_shown')) {
                const toastElement = document.getElementById('welcomeToast');
                if (toastElement) {
                    const toast = new bootstrap.Toast(toastElement);
                    toast.show();
                    sessionStorage.setItem('studyhub_welcome_shown', 'true');
                    
                    // Auto-ocultar después de 5 segundos
                    setTimeout(() => {
                        this.hideWelcomeToast();
                    }, 5000);
                }
            }
        }, 2000);
    }

    hideWelcomeToast() {
        const toastElement = document.getElementById('welcomeToast');
        if (toastElement) {
            const toast = bootstrap.Toast.getInstance(toastElement);
            if (toast) {
                toast.hide();
            }
        }
    }

    // Método para limpiar recursos si es necesario
    destroy() {
        // Limpiar event listeners si es necesario
        window.removeEventListener('scroll', this.animateOnScroll);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.studyHubHome = new StudyHubHome();
});

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudyHubHome;
}