// View-specific scripts for Auth/Register
// Auth.Register.js - Funcionalidad para la página de registro
class AuthRegister {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.registerButton = document.getElementById('registerButton');
        this.toast = document.getElementById('registerToast');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordStrength();
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

        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordConfirmation());
        }

        // Password strength calculation
        const password = document.getElementById('password');
        if (password) {
            password.addEventListener('input', () => {
                this.calculatePasswordStrength();
                this.validatePasswordConfirmation();
            });
        }

        // Terms agreement validation
        const termsCheckbox = document.getElementById('termsAgreement');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => this.validateTerms());
        }

        // Enter key submission
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.form) {
                this.handleSubmit(e);
            }
        });
    }

    setupPasswordStrength() {
        this.passwordStrength = {
            weak: { class: 'password-weak', text: 'Contraseña débil' },
            medium: { class: 'password-medium', text: 'Contraseña media' },
            strong: { class: 'password-strong', text: 'Contraseña fuerte' },
            veryStrong: { class: 'password-very-strong', text: 'Contraseña muy fuerte' }
        };
    }

    calculatePasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthBar = document.getElementById('passwordStrength');
        const feedback = document.getElementById('passwordFeedback');
        
        if (!password) {
            strengthBar.className = 'progress-bar';
            strengthBar.style.width = '0%';
            feedback.textContent = 'La contraseña debe tener al menos 6 caracteres';
            return;
        }

        let strength = 0;
        let feedbackText = '';

        // Longitud mínima
        if (password.length >= 6) strength += 25;
        
        // Contiene números
        if (/\d/.test(password)) strength += 25;
        
        // Contiene letras minúsculas y mayúsculas
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        
        // Contiene caracteres especiales
        if (/[^a-zA-Z0-9]/.test(password)) strength += 25;

        // Actualizar barra y texto
        let strengthLevel;
        if (strength <= 25) {
            strengthLevel = this.passwordStrength.weak;
        } else if (strength <= 50) {
            strengthLevel = this.passwordStrength.medium;
        } else if (strength <= 75) {
            strengthLevel = this.passwordStrength.strong;
        } else {
            strengthLevel = this.passwordStrength.veryStrong;
        }

        strengthBar.className = 'progress-bar ' + strengthLevel.class;
        strengthBar.style.width = strength + '%';
        strengthBar.setAttribute('aria-valuenow', strength);
        feedback.textContent = strengthLevel.text;
    }

    validatePasswordConfirmation() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword');
        const errorElement = document.getElementById('confirmPasswordError');
        
        if (!confirmPassword || !errorElement) return;

        if (confirmPassword.value && password !== confirmPassword.value) {
            errorElement.textContent = 'Las contraseñas no coinciden';
            confirmPassword.classList.add('is-invalid');
            return false;
        } else if (confirmPassword.value && password === confirmPassword.value) {
            errorElement.textContent = '';
            confirmPassword.classList.remove('is-invalid');
            confirmPassword.classList.add('is-valid');
            return true;
        } else {
            errorElement.textContent = '';
            confirmPassword.classList.remove('is-invalid', 'is-valid');
            return null;
        }
    }

    validateTerms() {
        const termsCheckbox = document.getElementById('termsAgreement');
        return termsCheckbox ? termsCheckbox.checked : false;
    }

    validateForm() {
        let isValid = true;

        // Validar campos requeridos
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        // Validar confirmación de contraseña
        const passwordConfirmationValid = this.validatePasswordConfirmation();
        if (passwordConfirmationValid === false) {
            isValid = false;
        }

        // Validar términos
        if (!this.validateTerms()) {
            this.showToast('Debes aceptar los términos de servicio', 'error');
            isValid = false;
        }

        // Validar fortaleza de contraseña
        const password = document.getElementById('password').value;
        if (password && password.length < 6) {
            this.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            isValid = false;
        }

        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
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
            this.showToast('Error al crear la cuenta. Intenta nuevamente.', 'error');
            this.setLoadingState(false);
        }
    }

    async submitForm() {
        // En una aplicación real, aquí iría la petición fetch/ajax
        return new Promise((resolve) => {
            setTimeout(() => {
                // El formulario se enviará normalmente
                resolve();
            }, 2000);
        });
    }

    setLoadingState(isLoading) {
        if (!this.registerButton) return;
        const btnText = this.registerButton.querySelector('.btn-text');
        const btnLoading = this.registerButton.querySelector('.btn-loading');
        if (!btnText || !btnLoading) {
            this.registerButton.disabled = !!isLoading;
            return;
        }
        
        if (isLoading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            this.registerButton.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            this.registerButton.disabled = false;
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
    window.authRegister = new AuthRegister();
});

// Manejar el evento beforeunload para limpiar
window.addEventListener('beforeunload', function() {
    if (window.authRegister) {
        window.authRegister.destroy();
    }
});
