// View-specific scripts for Clases/Delete
// Clases.Delete.js - Funcionalidad para la eliminación de clases
class ClasesDelete {
    constructor() {
        this.form = document.getElementById('deleteForm');
        this.deleteButton = document.getElementById('deleteButton');
        this.confirmCheckbox = document.getElementById('confirmDelete');
        this.finalConfirmButton = document.getElementById('confirmFinalDelete');
        this.cancelButton = document.getElementById('cancelButton');
        this.modal = new bootstrap.Modal(document.getElementById('finalConfirmationModal'));
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupConfirmationLogic();
    }

    setupEventListeners() {
        // Cambio en la checkbox de confirmación
        if (this.confirmCheckbox) {
            this.confirmCheckbox.addEventListener('change', () => this.toggleDeleteButton());
        }

        // Click en el botón de eliminar (primera confirmación)
        if (this.deleteButton) {
            this.deleteButton.addEventListener('click', (e) => this.handleDeleteClick(e));
        }

        // Click en el botón de cancelar
        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', () => this.handleCancel());
        }

        // Confirmación final en el modal
        if (this.finalConfirmButton) {
            this.finalConfirmButton.addEventListener('click', () => this.confirmFinalDelete());
        }

        // Prevenir envío del formulario por Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.form) {
                e.preventDefault();
            }
        });

        // Efecto de shake si intentan enviar sin confirmar
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    setupConfirmationLogic() {
        // Inicializar estado del botón
        this.toggleDeleteButton();
    }

    toggleDeleteButton() {
        if (this.deleteButton && this.confirmCheckbox) {
            this.deleteButton.disabled = !this.confirmCheckbox.checked;
        }
    }

    handleDeleteClick(e) {
        e.preventDefault();
        
        if (!this.confirmCheckbox.checked) {
            this.showShakeEffect();
            this.showAlert('Debes confirmar que entiendes las consecuencias', 'warning');
            return;
        }

        // Mostrar modal de confirmación final
        this.modal.show();
    }

    handleCancel() {
        // Navegar de vuelta a la lista de clases
        window.location.href = document.querySelector('[asp-action="Index"]')?.href || '/Clases';
    }

    confirmFinalDelete() {
        // Cerrar modal
        this.modal.hide();
        
        // Mostrar estado de carga
        this.setLoadingState(true);
        
        // Enviar formulario después de un breve delay para que se cierre el modal
        setTimeout(() => {
            this.form.submit();
        }, 500);
    }

    handleFormSubmit(e) {
        if (!this.confirmCheckbox.checked) {
            e.preventDefault();
            this.showShakeEffect();
            this.showAlert('Debes confirmar la eliminación primero', 'warning');
            return;
        }
        
        // Mostrar estado de carga
        this.setLoadingState(true);
    }

    setLoadingState(isLoading) {
        const btnText = this.deleteButton?.querySelector('.btn-text');
        const btnLoading = this.deleteButton?.querySelector('.btn-loading');
        
        if (btnText && btnLoading) {
            if (isLoading) {
                btnText.classList.add('d-none');
                btnLoading.classList.remove('d-none');
                this.deleteButton.disabled = true;
            } else {
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
                this.deleteButton.disabled = !this.confirmCheckbox?.checked;
            }
        }
    }

    showShakeEffect() {
        this.confirmCheckbox?.classList.add('shake');
        setTimeout(() => {
            this.confirmCheckbox?.classList.remove('shake');
        }, 500);
    }

    showAlert(message, type = 'info') {
        // Crear alerta temporal
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            <i class="bi bi-${this.getAlertIcon(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insertar después del header
        const header = document.querySelector('.delete-class-header');
        if (header) {
            header.parentNode.insertBefore(alert, header.nextSibling);
        }

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    getAlertIcon(type) {
        switch (type) {
            case 'warning':
                return 'exclamation-triangle-fill';
            case 'danger':
                return 'x-circle-fill';
            case 'success':
                return 'check-circle-fill';
            default:
                return 'info-circle-fill';
        }
    }

    // Método para prevenir navegación accidental
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            if (this.confirmCheckbox?.checked) {
                e.preventDefault();
                e.returnValue = 'Los cambios que hayas hecho podrían no guardarse.';
                return e.returnValue;
            }
        });
    }

    // Método para limpiar recursos
    destroy() {
        window.removeEventListener('beforeunload', this.setupBeforeUnload);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.clasesDelete = new ClasesDelete();
});

// Manejar el evento beforeunload para limpiar
window.addEventListener('beforeunload', function() {
    if (window.clasesDelete) {
        window.clasesDelete.destroy();
    }
});