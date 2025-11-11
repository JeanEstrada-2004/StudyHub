// View-specific scripts for Clases/Edit
// Clases.Edit.js - Funcionalidad para la edición de clases
class ClasesEdit {
    constructor() {
        this.form = document.getElementById('editClassForm');
        this.saveButton = document.getElementById('saveButton');
        this.resetButton = document.getElementById('resetButton');
        this.toast = document.getElementById('editClassToast');
        this.modal = new bootstrap.Modal(document.getElementById('changesModal'));
        this.originalData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupPreview();
        this.storeOriginalData();
        this.animateElements();
    }

    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Reset button
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.handleReset());
        }

        // Real-time validation and preview updates
        const inputs = this.form?.querySelectorAll('input, select, textarea');
        inputs?.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
                this.updatePreview();
                this.checkForChanges();
            });
            
            input.addEventListener('blur', () => this.validateField(input));
        });

        // Checkbox changes
        const esPublica = document.getElementById('esPublica');
        if (esPublica) {
            esPublica.addEventListener('change', () => {
                this.updatePreview();
                this.checkForChanges();
            });
        }

        // Prevent accidental navigation
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
                return e.returnValue;
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.handleSubmit(e);
            }
            
            if (e.key === 'Escape') {
                this.handleCancel();
            }
        });
    }

    setupFormValidation() {
        // Validación personalizada para campos específicos
        const tituloInput = document.getElementById('Titulo');
        if (tituloInput) {
            tituloInput.addEventListener('input', () => {
                this.validateTitulo(tituloInput);
            });
        }

        const maxEstudiantesInput = document.getElementById('MaxEstudiantes');
        if (maxEstudiantesInput) {
            maxEstudiantesInput.addEventListener('input', () => {
                this.validateMaxEstudiantes(maxEstudiantesInput);
            });
        }

        const cursoSelect = document.getElementById('CursoId');
        if (cursoSelect) {
            cursoSelect.addEventListener('change', () => {
                this.validateCurso(cursoSelect);
            });
        }
    }

    setupPreview() {
        // Inicializar la vista previa con los valores actuales
        this.updatePreview();
    }

    storeOriginalData() {
        // Guardar los valores originales para detectar cambios
        const formData = new FormData(this.form);
        this.originalData = {};
        
        for (let [key, value] of formData.entries()) {
            this.originalData[key] = value;
        }
        
        // Guardar también el estado del checkbox
        const esPublica = document.getElementById('esPublica');
        if (esPublica) {
            this.originalData['EsPublica'] = esPublica.checked;
        }
    }

    validateField(field) {
        switch (field.type) {
            case 'text':
            case 'textarea':
                return this.validateRequired(field);
            case 'number':
                return this.validateNumber(field);
            case 'select-one':
                return this.validateSelect(field);
            default:
                return true;
        }
    }

    validateRequired(field) {
        const isValid = field.value.trim() !== '';
        this.setFieldValidation(field, isValid, 'Este campo es obligatorio');
        return isValid;
    }

    validateNumber(field) {
        if (!field.value) return true; // Opcional
        
        const value = parseInt(field.value);
        const min = parseInt(field.getAttribute('min')) || 1;
        const max = parseInt(field.getAttribute('max')) || 100;
        
        const isValid = value >= min && value <= max;
        this.setFieldValidation(field, isValid, `El valor debe estar entre ${min} y ${max}`);
        return isValid;
    }

    validateSelect(field) {
        const isValid = field.value !== '';
        this.setFieldValidation(field, isValid, 'Debes seleccionar un curso');
        return isValid;
    }

    validateTitulo(field) {
        const value = field.value.trim();
        const isValid = value === '' || value.length >= 3;
        
        this.setFieldValidation(field, isValid, 'El título debe tener al menos 3 caracteres');
        return isValid;
    }

    validateMaxEstudiantes(field) {
        if (!field.value) return true;
        
        const value = parseInt(field.value);
        const isValid = value >= 1 && value <= 100;
        
        this.setFieldValidation(field, isValid, 'El límite debe estar entre 1 y 100 estudiantes');
        return isValid;
    }

    validateCurso(field) {
        const isValid = field.value !== '';
        this.setFieldValidation(field, isValid, 'Debes seleccionar un curso');
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

    updatePreview() {
        // Actualizar título
        const tituloInput = document.getElementById('Titulo');
        const previewTitle = document.getElementById('previewTitle');
        if (tituloInput && previewTitle) {
            previewTitle.textContent = tituloInput.value || 'Título de la clase';
        }

        // Actualizar descripción
        const descripcionInput = document.getElementById('Descripcion');
        const previewDescription = document.getElementById('previewDescription');
        if (descripcionInput && previewDescription) {
            if (descripcionInput.value.trim()) {
                previewDescription.textContent = descripcionInput.value;
                previewDescription.classList.remove('text-muted');
            } else {
                previewDescription.textContent = 'Descripción no disponible';
                previewDescription.classList.add('text-muted');
            }
        }

        // Actualizar curso
        const cursoSelect = document.getElementById('CursoId');
        const previewCourse = document.getElementById('previewCourse');
        if (cursoSelect && previewCourse) {
            const selectedOption = cursoSelect.options[cursoSelect.selectedIndex];
            previewCourse.textContent = selectedOption.text || 'Curso no seleccionado';
        }

        // Actualizar visibilidad
        const esPublica = document.getElementById('esPublica');
        const previewVisibility = document.getElementById('previewVisibility');
        if (esPublica && previewVisibility) {
            if (esPublica.checked) {
                previewVisibility.textContent = 'Pública';
                previewVisibility.className = 'badge bg-success';
            } else {
                previewVisibility.textContent = 'Privada';
                previewVisibility.className = 'badge bg-secondary';
            }
        }

        // Actualizar máximo de estudiantes
        const maxEstudiantesInput = document.getElementById('MaxEstudiantes');
        const previewMaxStudents = document.getElementById('previewMaxStudents');
        if (maxEstudiantesInput && previewMaxStudents) {
            if (maxEstudiantesInput.value) {
                previewMaxStudents.textContent = maxEstudiantesInput.value;
            } else {
                previewMaxStudents.textContent = 'Ilimitado';
            }
        }
    }

    checkForChanges() {
        const hasChanges = this.hasUnsavedChanges();
        
        if (hasChanges) {
            document.title = document.title.replace('', ' • ') + 'Modificaciones sin guardar';
        } else {
            document.title = document.title.replace(' • Modificaciones sin guardar', '');
        }
    }

    hasUnsavedChanges() {
        const formData = new FormData(this.form);
        let hasChanges = false;

        // Verificar cambios en campos de formulario
        for (let [key, value] of formData.entries()) {
            if (this.originalData[key] !== value) {
                hasChanges = true;
                break;
            }
        }

        // Verificar cambios en checkbox
        const esPublica = document.getElementById('esPublica');
        if (esPublica && this.originalData['EsPublica'] !== esPublica.checked) {
            hasChanges = true;
        }

        return hasChanges;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar todos los campos requeridos
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
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
            // En una aplicación real, aquí iría la petición fetch/ajax
            await this.submitForm();
            
            // Mostrar modal de éxito
            this.showSuccessModal();
            
        } catch (error) {
            this.showToast('Error al guardar los cambios. Intenta nuevamente.', 'error');
            this.setLoadingState(false);
        }
    }

    async submitForm() {
        // En una aplicación real, aquí iría la petición fetch/ajax
        return new Promise((resolve) => {
            setTimeout(() => {
                // El formulario se enviará normalmente
                resolve();
            }, 1500);
        });
    }

    handleReset() {
        if (confirm('¿Estás seguro de que quieres restablecer todos los cambios?')) {
            this.form.reset();
            
            // Restaurar el estado del checkbox
            const esPublica = document.getElementById('esPublica');
            if (esPublica && this.originalData['EsPublica'] !== undefined) {
                esPublica.checked = this.originalData['EsPublica'] === 'true';
            }
            
            this.updatePreview();
            this.showToast('Cambios restablecidos', 'info');
        }
    }

    handleCancel() {
        if (this.hasUnsavedChanges()) {
            if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
                window.location.href = document.querySelector('[asp-action="Details"]')?.href || '/Clases';
            }
        } else {
            window.location.href = document.querySelector('[asp-action="Details"]')?.href || '/Clases';
        }
    }

    showSuccessModal() {
        const changesList = document.getElementById('changesList');
        if (changesList) {
            changesList.innerHTML = '';
            
            // Aquí podrías listar los cambios específicos
            const changes = this.getChangesList();
            changes.forEach(change => {
                const item = document.createElement('div');
                item.className = 'change-item';
                item.textContent = change;
                changesList.appendChild(item);
            });
        }
        
        this.modal.show();
    }

    getChangesList() {
        const changes = [];
        const formData = new FormData(this.form);

        // Comparar cambios con datos originales
        for (let [key, value] of formData.entries()) {
            if (this.originalData[key] !== value) {
                changes.push(`Cambio en ${this.getFieldLabel(key)}`);
            }
        }

        // Verificar cambios en checkbox
        const esPublica = document.getElementById('esPublica');
        if (esPublica && this.originalData['EsPublica'] !== esPublica.checked.toString()) {
            changes.push('Cambio en visibilidad de la clase');
        }

        return changes.length > 0 ? changes : ['Cambios guardados correctamente'];
    }

    getFieldLabel(fieldName) {
        const labels = {
            'Titulo': 'título',
            'Descripcion': 'descripción',
            'CursoId': 'curso',
            'MaxEstudiantes': 'límite de estudiantes'
        };
        
        return labels[fieldName] || fieldName;
    }

    setLoadingState(isLoading) {
        const btnText = this.saveButton.querySelector('.btn-text');
        const btnLoading = this.saveButton.querySelector('.btn-loading');
        
        if (isLoading) {
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            this.saveButton.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
            this.saveButton.disabled = false;
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
            case 'warning':
                toastHeader.classList.add('bi-exclamation-triangle-fill', 'text-warning');
                break;
            default:
                toastHeader.classList.add('bi-info-circle', 'text-primary');
        }

        const bsToast = new bootstrap.Toast(this.toast);
        bsToast.show();
    }

    animateElements() {
        // Animación para secciones del formulario
        const sections = document.querySelectorAll('.form-section');
        sections?.forEach((section, index) => {
            section.style.animation = `fadeInUp 0.6s ease-out ${index * 0.2}s both`;
        });

        // Animación para la previsualización
        const previewSection = document.querySelector('.preview-section');
        if (previewSection) {
            previewSection.style.animation = `fadeInUp 0.6s ease-out 0.6s both`;
        }
    }

    // Método para limpiar recursos
    destroy() {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.clasesEdit = new ClasesEdit();
});

// Manejar el evento beforeunload para limpiar
window.addEventListener('beforeunload', function() {
    if (window.clasesEdit) {
        window.clasesEdit.destroy();
    }
});