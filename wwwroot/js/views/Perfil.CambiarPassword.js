// View-specific scripts for Perfil/CambiarPassword
// Funcionalidad específica para Cambiar Contraseña - StudyHub
class CambiarPasswordStudyHub {
    constructor() {
        this.passwordStrength = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordStrength();
        this.setupAnimations();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Toggle de visibilidad de contraseña
        const toggleButtons = document.querySelectorAll('.toggle-password');
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.togglePasswordVisibility(e.target);
            });
        });

        // Validación de nueva contraseña
        const nuevaPasswordInput = document.getElementById('nuevaPassword');
        if (nuevaPasswordInput) {
            nuevaPasswordInput.addEventListener('input', () => {
                this.validatePasswordStrength(nuevaPasswordInput.value);
            });
        }

        // Validación de confirmación de contraseña
        const confirmarPasswordInput = document.getElementById('confirmarPassword');
        if (confirmarPasswordInput) {
            confirmarPasswordInput.addEventListener('input', () => {
                this.validatePasswordConfirmation();
            });
        }

        // Envío del formulario
        const form = document.getElementById('cambiarPasswordForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Auto-focus en primer campo
        this.setupAutoFocus();
    }

    setupPasswordStrength() {
        // Inicializar el indicador de fortaleza
        this.updatePasswordStrength(0);
    }

    setupAnimations() {
        // Animación para la card principal
        const card = document.querySelector('.card');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }

        // Animación para el icono
        const icon = document.querySelector('.password-icon');
        if (icon) {
            icon.style.opacity = '0';
            icon.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                icon.style.transition = 'all 0.5s ease';
                icon.style.opacity = '1';
                icon.style.transform = 'scale(1)';
            }, 200);
        }
    }

    togglePasswordVisibility(button) {
        const targetId = button.closest('.toggle-password').dataset.target;
        const passwordInput = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'bi bi-eye-slash';
            button.setAttribute('aria-label', 'Ocultar contraseña');
        } else {
            passwordInput.type = 'password';
            icon.className = 'bi bi-eye';
            button.setAttribute('aria-label', 'Mostrar contraseña');
        }
    }

    validatePasswordStrength(password) {
        let strength = 0;
        const requirements = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        // Calcular fortaleza
        if (requirements.length) strength += 20;
        if (requirements.upper) strength += 20;
        if (requirements.lower) strength += 20;
        if (requirements.number) strength += 20;
        if (requirements.special) strength += 20;

        this.passwordStrength = strength;
        this.updatePasswordStrength(strength);
        this.updateRequirementsUI(requirements);
    }

    updatePasswordStrength(strength) {
        const strengthBar = document.getElementById('passwordStrengthBar');
        const strengthText = document.getElementById('passwordStrengthText');
        
        if (!strengthBar || !strengthText) return;

        strengthBar.style.width = `${strength}%`;
        
        // Actualizar colores y texto según la fortaleza
        if (strength < 40) {
            strengthBar.className = 'progress-bar password-weak';
            strengthText.textContent = 'Contraseña débil';
            strengthText.className = 'text-danger';
        } else if (strength < 60) {
            strengthBar.className = 'progress-bar password-fair';
            strengthText.textContent = 'Contraseña regular';
            strengthText.className = 'text-warning';
        } else if (strength < 80) {
            strengthBar.className = 'progress-bar password-good';
            strengthText.textContent = 'Contraseña buena';
            strengthText.className = 'text-info';
        } else {
            strengthBar.className = 'progress-bar password-strong';
            strengthText.textContent = 'Contraseña fuerte';
            strengthText.className = 'text-success';
        }
    }

    updateRequirementsUI(requirements) {
        // Actualizar checkboxes de requisitos
        Object.keys(requirements).forEach(key => {
            const checkbox = document.getElementById(`req${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (checkbox) {
                checkbox.checked = requirements[key];
            }
        });
    }

    validatePasswordConfirmation() {
        const nuevaPassword = document.getElementById('nuevaPassword').value;
        const confirmarPassword = document.getElementById('confirmarPassword').value;
        const errorElement = document.getElementById('confirmarPasswordError');
        
        if (confirmarPassword && nuevaPassword !== confirmarPassword) {
            errorElement.style.display = 'block';
            document.getElementById('confirmarPassword').classList.add('is-invalid');
            return false;
        } else {
            errorElement.style.display = 'none';
            document.getElementById('confirmarPassword').classList.remove('is-invalid');
            if (confirmarPassword) {
                document.getElementById('confirmarPassword').classList.add('is-valid');
            }
            return true;
        }
    }

    handleFormSubmit(e) {
        const nuevaPassword = document.getElementById('nuevaPassword').value;
        const confirmarPassword = document.getElementById('confirmarPassword').value;
        const submitBtn = document.getElementById('submitBtn');
        
        // Validar fortaleza de contraseña
        if (this.passwordStrength < 60) {
            e.preventDefault();
            this.showToast('La contraseña no cumple con los requisitos mínimos de seguridad', 'error');
            document.getElementById('nuevaPassword').focus();
            return;
        }
        
        // Validar confirmación de contraseña
        if (!this.validatePasswordConfirmation()) {
            e.preventDefault();
            this.showToast('Las contraseñas no coinciden', 'error');
            document.getElementById('confirmarPassword').focus();
            return;
        }
        
        // Validar longitud mínima
        if (nuevaPassword.length < 8) {
            e.preventDefault();
            this.showToast('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        
        // Mostrar estado de carga
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Cambiando contraseña...';
            submitBtn.disabled = true;
        }
        
        // Trackeo de analytics
        this.trackPasswordChange();
    }

    handleKeyboardShortcuts(e) {
        // Toggle de visibilidad con Ctrl+.
        if (e.ctrlKey && e.key === '.') {
            e.preventDefault();
            const activeElement = document.activeElement;
            if (activeElement.type === 'password') {
                this.togglePasswordVisibility(activeElement.nextElementSibling?.querySelector('i'));
            }
        }
        
        // Enviar formulario con Ctrl+Enter
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('cambiarPasswordForm').dispatchEvent(new Event('submit'));
        }
        
        // Navegación entre campos con Tab
        if (e.key === 'Tab') {
            // Aquí se podrían añadir validaciones durante la navegación
        }
    }

    setupAutoFocus() {
        // Auto-focus en el primer campo si no hay errores
        const firstError = document.querySelector('.text-danger');
        if (!firstError) {
            setTimeout(() => {
                document.getElementById('passwordActual')?.focus();
            }, 300);
        }
    }

    trackPasswordChange() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'password_change_attempt', {
                'event_category': 'security',
                'event_label': 'password_change_form'
            });
        }
    }

    analyticsTracking() {
        console.log('Vista de Cambiar Contraseña cargada - StudyHub Analytics');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'password_change_view', {
                'event_category': 'engagement',
                'event_label': 'password_change_page_loaded'
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

    // Método para generar contraseña segura (opcional)
    generateSecurePassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    }

    // Método para sugerir contraseña (opcional)
    suggestPassword() {
        const suggestedPassword = this.generateSecurePassword();
        document.getElementById('nuevaPassword').value = suggestedPassword;
        document.getElementById('confirmarPassword').value = suggestedPassword;
        
        this.validatePasswordStrength(suggestedPassword);
        this.validatePasswordConfirmation();
        
        this.showToast('Contraseña segura generada automáticamente', 'success');
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new CambiarPasswordStudyHub();
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
    
    @media (prefers-reduced-motion: reduce) {
        .spin {
            animation: none;
        }
    }
`;
document.head.appendChild(style);

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en Cambiar Contraseña StudyHub:', e.error);
});