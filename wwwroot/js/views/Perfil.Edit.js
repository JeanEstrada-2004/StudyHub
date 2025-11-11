// View-specific scripts for Perfil/Edit
// Funcionalidad específica para Editar Perfil - StudyHub
class EditarPerfilStudyHub {
    constructor() {
        this.originalFormData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupRealTimePreview();
        this.setupFormValidation();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Botón de restablecer formulario
        const resetBtn = document.getElementById('resetFormBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm();
            });
        }

        // Envío del formulario
        const form = document.getElementById('editProfileForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }

        // Guardar datos originales para restablecer
        this.saveOriginalFormData();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Auto-guardado (opcional)
        this.setupAutoSave();
    }

    setupAnimations() {
        // Animación para la card principal
        const mainCard = document.querySelector('.col-lg-8 .card');
        if (mainCard) {
            mainCard.style.opacity = '0';
            mainCard.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                mainCard.style.transition = 'all 0.6s ease';
                mainCard.style.opacity = '1';
                mainCard.style.transform = 'translateY(0)';
            }, 100);
        }

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

    setupRealTimePreview() {
        // Actualizar vista previa en tiempo real
        const nombreInput = document.getElementById('Nombre');
        const emailInput = document.getElementById('Email');
        const rolSelect = document.getElementById('Rol');

        if (nombreInput) {
            nombreInput.addEventListener('input', () => {
                this.updatePreview('nombre', nombreInput.value);
            });
        }

        if (emailInput) {
            emailInput.addEventListener('input', () => {
                this.updatePreview('email', emailInput.value);
            });
        }

        if (rolSelect) {
            rolSelect.addEventListener('change', () => {
                this.updatePreview('rol', rolSelect.value);
            });
        }
    }

    setupFormValidation() {
        // Validación en tiempo real
        const inputs = document.querySelectorAll('#editProfileForm input, #editProfileForm select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });

        // Validación personalizada para email
        const emailInput = document.getElementById('Email');
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                this.validateEmail(emailInput.value);
            });
        }
    }

    setupAutoSave() {
        // Auto-guardado cada 30 segundos (opcional)
        setInterval(() => {
            if (this.hasFormChanges()) {
                this.autoSaveDraft();
            }
        }, 30000);
    }

    saveOriginalFormData() {
        // Guardar estado original del formulario
        const form = document.getElementById('editProfileForm');
        if (form) {
            const formData = new FormData(form);
            this.originalFormData = {
                Nombre: document.getElementById('Nombre')?.value || '',
                Email: document.getElementById('Email')?.value || '',
                Rol: document.getElementById('Rol')?.value || ''
            };
        }
    }

    resetForm() {
        if (confirm('¿Estás seguro de que deseas restablecer todos los cambios?')) {
            document.getElementById('Nombre').value = this.originalFormData.Nombre;
            document.getElementById('Email').value = this.originalFormData.Email;
            document.getElementById('Rol').value = this.originalFormData.Rol;

            // Actualizar vista previa
            this.updatePreview('nombre', this.originalFormData.Nombre);
            this.updatePreview('email', this.originalFormData.Email);
            this.updatePreview('rol', this.originalFormData.Rol);

            // Limpiar validaciones
            this.clearValidations();

            this.showToast('Formulario restablecido correctamente', 'success');
        }
    }

    updatePreview(field, value) {
        const previewMap = {
            'nombre': 'previewNombre',
            'email': 'previewEmail',
            'rol': 'previewRol'
        };

        const element = document.getElementById(previewMap[field]);
        if (element) {
            // Animación de transición
            element.style.opacity = '0.7';
            element.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                if (field === 'rol') {
                    element.textContent = value;
                    element.className = `badge bg-${value === 'Profesor' ? 'warning' : 'primary'}`;
                } else {
                    element.textContent = value || 'No especificado';
                }
                
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
                element.style.transition = 'all 0.3s ease';
            }, 150);
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        switch (field.name) {
            case 'Nombre':
                if (!value) {
                    isValid = false;
                    message = 'El nombre es obligatorio';
                } else if (value.length < 2) {
                    isValid = false;
                    message = 'El nombre debe tener al menos 2 caracteres';
                } else if (value.length > 50) {
                    isValid = false;
                    message = 'El nombre no puede tener más de 50 caracteres';
                }
                break;

            case 'Email':
                if (!value) {
                    isValid = false;
                    message = 'El email es obligatorio';
                } else if (!this.isValidEmail(value)) {
                    isValid = false;
                    message = 'Ingresa un email válido';
                }
                break;

            case 'Rol':
                if (!value) {
                    isValid = false;
                    message = 'Debes seleccionar un rol';
                }
                break;
        }

        this.showFieldValidation(field, isValid, message);
        return isValid;
    }

    validateEmail(email) {
        const emailInput = document.getElementById('Email');
        if (!email) return true;

        const isValid = this.isValidEmail(email);
        this.showFieldValidation(emailInput, isValid, 
            isValid ? '' : 'Ingresa un email válido');
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldValidation(field, isValid, message) {
        // Remover estados previos
        field.classList.remove('is-valid', 'is-invalid');
        
        const feedbackElement = field.nextElementSibling;
        
        if (isValid) {
            field.classList.add('is-valid');
            if (feedbackElement && feedbackElement.classList.contains('text-danger')) {
                feedbackElement.style.display = 'none';
            }
        } else {
            field.classList.add('is-invalid');
            if (feedbackElement && feedbackElement.classList.contains('text-danger')) {
                feedbackElement.querySelector('span').textContent = message;
                feedbackElement.style.display = 'block';
            }
        }
    }

    clearValidations() {
        const inputs = document.querySelectorAll('#editProfileForm input, #editProfileForm select');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });

        const feedbackElements = document.querySelectorAll('.text-danger');
        feedbackElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    hasFormChanges() {
        const currentData = {
            Nombre: document.getElementById('Nombre')?.value || '',
            Email: document.getElementById('Email')?.value || '',
            Rol: document.getElementById('Rol')?.value || ''
        };

        return JSON.stringify(currentData) !== JSON.stringify(this.originalFormData);
    }

    autoSaveDraft() {
        // Simular auto-guardado
        console.log('Auto-guardando borrador...');
        // En una implementación real, aquí se haría una petición AJAX
    }

    handleFormSubmit(e) {
        const nombre = document.getElementById('Nombre').value.trim();
        const email = document.getElementById('Email').value.trim();
        const rol = document.getElementById('Rol').value;
        const submitBtn = document.getElementById('submitBtn');

        // Validaciones finales
        let isValid = true;

        if (!nombre) {
            this.validateField(document.getElementById('Nombre'));
            isValid = false;
        }

        if (!email || !this.isValidEmail(email)) {
            this.validateField(document.getElementById('Email'));
            isValid = false;
        }

        if (!rol) {
            this.validateField(document.getElementById('Rol'));
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
            this.showToast('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        // Mostrar estado de carga
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Guardando...';
            submitBtn.disabled = true;
        }

        // Trackeo de analytics
        this.trackProfileUpdate();
    }

    handleKeyboardShortcuts(e) {
        // Guardar con Ctrl+S
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            document.getElementById('editProfileForm').dispatchEvent(new Event('submit'));
        }

        // Restablecer con Ctrl+R
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            this.resetForm();
        }

        // Navegación entre secciones con Ctrl+1, Ctrl+2, etc.
        if (e.ctrlKey && e.key >= '1' && e.key <= '3') {
            e.preventDefault();
            this.navigateToSection(parseInt(e.key));
        }
    }

    navigateToSection(sectionNumber) {
        const sections = [
            document.getElementById('Nombre'),
            document.getElementById('Email'),
            document.getElementById('Rol')
        ];

        if (sections[sectionNumber - 1]) {
            sections[sectionNumber - 1].focus();
        }
    }

    trackProfileUpdate() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'profile_update_attempt', {
                'event_category': 'engagement',
                'event_label': 'profile_edit_form'
            });
        }
    }

    analyticsTracking() {
        console.log('Vista de Editar Perfil cargada - StudyHub Analytics');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'profile_edit_view', {
                'event_category': 'engagement',
                'event_label': 'profile_edit_page_loaded'
            });
        }
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
    new EditarPerfilStudyHub();
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
    
    .is-valid {
        border-color: var(--studyhub-success) !important;
    }
    
    .is-invalid {
        border-color: var(--studyhub-danger) !important;
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
    console.error('Error en Editar Perfil StudyHub:', e.error);
});