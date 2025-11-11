// View-specific scripts for Auth/Login
// Auth.Login.js - Funcionalidad para la página de inicio de sesión
class AuthLogin {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.loginButton = document.getElementById('loginButton');
        this.toast = document.getElementById('loginToast');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.animateElements();
    }

    setupEventListeners() {
        // Toggle password visibility
        const togglePassword = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');

        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Cambiar icono
                const icon = togglePassword.querySelector('i');
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            });
        }

        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Input validation on blur
        const inputs = this.form?.querySelectorAll('input');
        inputs?.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldValidation(input));
        });

        // Enter key submission
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.form) {
                this.handleSubmit(e);
            }
        });
    }

    setupFormValidation() {
        // Agregar validación personalizada
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                this.validateEmail(emailInput);
            });
        }
    }

    validateField(field) {
        switch (field.type) {
            case 'email':
                return this.validateEmail(field);
            case 'password':
                return this.validatePassword(field);
            default:
                return this.validateRequired(field);
        }
    }

    validateEmail(field) {
        const value = field.value.trim();
        const isValid = value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        
        this.setFieldValidation(field, isValid, 'Por favor ingresa un correo electrónico válido');
        return isValid;
    }

    validatePassword(field) {
        const value = field.value.trim();
        const isValid = value === '' || value.length >= 6;
        
        this.setFieldValidation(field, isValid, 'La contraseña debe tener al menos 6 caracteres');
        return isValid;
    }

    validateRequired(field) {
        const isValid = field.value.trim() !== '';
        this.setFieldValidation(field, isValid, 'Este campo es obligatorio');
        return isValid;
    }

    setFieldValidation(field, isValid, message) {
        field.classList.remove('is-valid', 'is-invalid');
        
        // Remover mensajes de error existentes
        const existingFeedback = field.parentNode.querySelector('.invalid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        if (field.value.trim() === '') {
            return; // No validar campos vacíos hasta que se interactúe
        }

        if (isValid) {
            field.classList.add('is-valid');
        } else {
            field.classList.add('is-invalid');
            
            // Agregar mensaje de error
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = message;
            field.parentNode.appendChild(feedback);
        }
    }

    clearFieldValidation(field) {
        field.classList.remove('is-invalid');
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar todos los campos
        const inputs = this.form.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showToast('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        // Mostrar estado de carga
        this.setLoadingState(true);

        try {
            // Simular envío (en producción esto sería una petición real)
            await this.submitForm();
            if (this.form) {
                this.form.submit();
            }
        } catch (error) {
            this.showToast('Error al iniciar sesión. Intenta nuevamente.', 'error');
            this.setLoadingState(false);
        }
    }

    async submitForm() {
        // En una aplicación real, aquí iría la petición fetch/ajax
        // Por ahora simulamos una petición con delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // El formulario se enviará normalmente ya que no estamos previniendo el envío real
                resolve();
            }, 1500);
        });
    }

    setLoadingState(isLoading) {
        if (!this.loginButton) return;
        const btnText = this.loginButton.querySelector('.btn-text');
        const btnLoading = this.loginButton.querySelector('.btn-loading');
        if (!btnText || !btnLoading) {
            this.loginButton.disabled = !!isLoading;
            return;
        }
        
        if (isLoading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            this.loginButton.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            this.loginButton.disabled = false;
        }
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
            default:
                toastHeader.classList.add('bi-info-circle', 'text-primary');
        }

        const bsToast = new bootstrap.Toast(this.toast);
        bsToast.show();
    }

    animateElements() {
        // Animación para elementos de entrada
        const inputs = this.form?.querySelectorAll('.form-group');
        inputs?.forEach((input, index) => {
            input.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
        });
    }

    // Método para limpiar recursos
    destroy() {
        // Limpiar event listeners si es necesario
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.authLogin = new AuthLogin();
});

// Manejar el evento beforeunload para limpiar
window.addEventListener('beforeunload', function() {
    if (window.authLogin) {
        window.authLogin.destroy();
    }
});
