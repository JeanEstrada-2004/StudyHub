// Funcionalidades globales para StudyHub
document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            try {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            } catch {}
        }, 5000);
    });

    // Confirmación para acciones destructivas
    const deleteButtons = document.querySelectorAll('form[action*="Delete"] button[type="submit"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.')) {
                e.preventDefault();
            }
        });
    });

    // Mejora para formularios: mostrar loading en submit
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            if (!submitBtn) return;

            // If button has custom loading UI (.btn-text/.btn-loading), do not replace its HTML
            const hasCustomLoading = submitBtn.tagName === 'BUTTON' &&
                submitBtn.querySelector('.btn-text') && submitBtn.querySelector('.btn-loading');

            if (hasCustomLoading) {
                // Only disable to avoid double submit; view-specific script handles UI
                submitBtn.disabled = true;
                return;
            }

            // Generic fallback for other forms
            submitBtn.disabled = true;
            if (submitBtn.tagName === 'BUTTON') {
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Procesando...';
            }
        });
    });
});

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}
