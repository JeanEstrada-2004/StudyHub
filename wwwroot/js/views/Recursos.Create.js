// View-specific scripts for Recursos/Create
// Funcionalidad específica para Crear Recurso - StudyHub
class CrearRecursoStudyHub {
    constructor() {
        this.currentTipo = 'Archivo';
        this.selectedFile = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupFileUpload();
        this.setupCharacterCounter();
        this.setupUrlPreview();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Selector de tipo
        const tipoOptions = document.querySelectorAll('.tipo-option');
        tipoOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectTipo(option.dataset.tipo);
            });
        });

        // Botón de limpiar formulario
        const resetBtn = document.getElementById('resetFormBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm();
            });
        }

        // Envío del formulario
        const form = document.getElementById('recursoForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }

        // Validación en tiempo real
        this.setupRealTimeValidation();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupAnimations() {
        // Animación para la card principal
        const mainCard = document.querySelector('.card');
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

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const fileSelectBtn = document.getElementById('fileSelectBtn');
        const fileDropZone = document.getElementById('fileDropZone');
        const fileInfo = document.getElementById('fileInfo');
        const fileRemoveBtn = document.getElementById('fileRemoveBtn');

        // Botón de selección de archivo
        if (fileSelectBtn && fileInput) {
            fileSelectBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // Cambio en la selección de archivo
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0]);
            });
        }

        // Drag and drop
        if (fileDropZone) {
            fileDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileDropZone.classList.add('dragover');
            });

            fileDropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                fileDropZone.classList.remove('dragover');
            });

            fileDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                fileDropZone.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });

            // Click en la zona de drop
            fileDropZone.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // Botón de eliminar archivo
        if (fileRemoveBtn) {
            fileRemoveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSelectedFile();
            });
        }
    }

    setupCharacterCounter() {
        const descripcionTextarea = document.getElementById('descripcionTextarea');
        const descripcionCount = document.getElementById('descripcionCount');
        
        if (descripcionTextarea && descripcionCount) {
            descripcionTextarea.addEventListener('input', () => {
                const length = descripcionTextarea.value.length;
                descripcionCount.textContent = length;
                
                // Cambiar color según la longitud
                if (length > 450) {
                    descripcionCount.className = 'danger';
                } else if (length > 400) {
                    descripcionCount.className = 'warning';
                } else {
                    descripcionCount.className = '';
                }
            });
            
            // Inicializar contador
            descripcionCount.textContent = descripcionTextarea.value.length;
        }
    }

    setupUrlPreview() {
        const urlInput = document.getElementById('urlInput');
        const linkPreview = document.getElementById('linkPreview');
        const previewTitle = document.getElementById('previewTitle');
        const previewUrl = document.getElementById('previewUrl');

        if (urlInput && linkPreview) {
            urlInput.addEventListener('input', () => {
                const url = urlInput.value.trim();
                
                if (url) {
                    // Extraer dominio para el título
                    try {
                        const domain = new URL(url).hostname;
                        previewTitle.textContent = `Enlace a ${domain}`;
                        previewUrl.textContent = url;
                        linkPreview.style.display = 'block';
                    } catch (e) {
                        previewTitle.textContent = 'Enlace externo';
                        previewUrl.textContent = url;
                        linkPreview.style.display = 'block';
                    }
                } else {
                    linkPreview.style.display = 'none';
                }
            });
        }
    }

    setupRealTimeValidation() {
        // Validación de título
        const tituloInput = document.querySelector('input[asp-for="Titulo"]');
        if (tituloInput) {
            tituloInput.addEventListener('blur', () => {
                this.validateTitulo(tituloInput.value);
            });
        }

        // Validación de URL
        const urlInput = document.getElementById('urlInput');
        if (urlInput) {
            urlInput.addEventListener('blur', () => {
                this.validateUrl(urlInput.value);
            });
        }
    }

    selectTipo(tipo) {
        if (this.currentTipo === tipo) return;
        
        this.currentTipo = tipo;
        
        // Actualizar UI
        const tipoOptions = document.querySelectorAll('.tipo-option');
        tipoOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.tipo === tipo);
        });

        // Actualizar radio button
        const radioButton = document.querySelector(`input[value="${tipo}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }

        // Mostrar/ocultar grupos de contenido
        this.toggleContentGroups(tipo);
        
        this.showToast(`Tipo de recurso cambiado a: ${tipo}`, 'info');
    }

    toggleContentGroups(tipo) {
        const archivoGroup = document.getElementById('archivoGroup');
        const enlaceGroup = document.getElementById('enlaceGroup');

        if (tipo === 'Archivo') {
            archivoGroup.style.display = 'block';
            enlaceGroup.style.display = 'none';
            
            // Animación
            archivoGroup.style.opacity = '0';
            setTimeout(() => {
                archivoGroup.style.transition = 'all 0.3s ease';
                archivoGroup.style.opacity = '1';
            }, 50);
        } else {
            archivoGroup.style.display = 'none';
            enlaceGroup.style.display = 'block';
            
            // Animación
            enlaceGroup.style.opacity = '0';
            setTimeout(() => {
                enlaceGroup.style.transition = 'all 0.3s ease';
                enlaceGroup.style.opacity = '1';
            }, 50);
        }
    }

    handleFileSelect(file) {
        if (!file) return;

        // Sincronizar con el input de archivo real para que el servidor reciba el archivo,
        // incluso cuando se usa drag & drop.
        const fileInput = document.getElementById('fileInput');
        if (fileInput && window.DataTransfer) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
        }

        // Validar tamaño (50MB máximo)
        const maxSize = 50 * 1024 * 1024; // 50MB en bytes
        if (file.size > maxSize) {
            this.showToast('El archivo es demasiado grande. Tamaño máximo: 50MB', 'error');
            return;
        }

        // Validar tipo de archivo
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|jpg|jpeg|png|gif)$/i)) {
            this.showToast('Tipo de archivo no permitido', 'error');
            return;
        }

        this.selectedFile = file;
        this.updateFileInfo(file);
        this.showToast('Archivo seleccionado correctamente', 'success');
    }

    updateFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');

        if (fileInfo && fileName && fileSize) {
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);
            fileInfo.style.display = 'block';
        }
    }

    removeSelectedFile() {
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        
        if (fileInput) {
            fileInput.value = '';
        }
        
        if (fileInfo) {
            fileInfo.style.display = 'none';
        }
        
        this.selectedFile = null;
        this.showToast('Archivo removido', 'info');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    validateTitulo(titulo) {
        const tituloInput = document.getElementById('Titulo');
        
        if (!titulo.trim()) {
            this.showFieldError(tituloInput, 'El título es obligatorio');
            return false;
        } else if (titulo.length < 3) {
            this.showFieldError(tituloInput, 'El título debe tener al menos 3 caracteres');
            return false;
        } else if (titulo.length > 100) {
            this.showFieldError(tituloInput, 'El título no puede tener más de 100 caracteres');
            return false;
        } else {
            this.clearFieldError(tituloInput);
            return true;
        }
    }

    validateUrl(url) {
        const urlInput = document.getElementById('urlInput');
        
        if (this.currentTipo === 'Enlace' && !url.trim()) {
            this.showFieldError(urlInput, 'La URL es obligatoria para enlaces');
            return false;
        } else if (url.trim() && !this.isValidUrl(url)) {
            this.showFieldError(urlInput, 'Ingresa una URL válida');
            return false;
        } else {
            this.clearFieldError(urlInput);
            return true;
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showFieldError(field, message) {
        if (!field) return;
        field.classList.add('is-invalid');
        
        // Buscar o crear elemento de error
        let errorElement = field.nextElementSibling;
        while (errorElement && !errorElement.classList.contains('text-danger')) {
            errorElement = errorElement.nextElementSibling;
        }
        
        if (errorElement && errorElement.classList.contains('text-danger')) {
            const span = errorElement.querySelector('span') || errorElement;
            span.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearFieldError(field) {
        if (!field) return;
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    }

    resetForm() {
        if (confirm('¿Estás seguro de que deseas limpiar todo el formulario?')) {
            const form = document.getElementById('recursoForm');
            if (form) {
                form.reset();
            }
            
            this.removeSelectedFile();
            this.selectTipo('Archivo');
            
            // Limpiar validaciones
            const fields = form.querySelectorAll('input, textarea, select');
            fields.forEach(field => {
                field.classList.remove('is-valid', 'is-invalid');
            });
            
            // Ocultar vista previa
            const linkPreview = document.getElementById('linkPreview');
            if (linkPreview) {
                linkPreview.style.display = 'none';
            }
            
            this.showToast('Formulario limpiado correctamente', 'success');
        }
    }

    handleFormSubmit(e) {
        const titulo = document.getElementById('Titulo')?.value.trim();
        const submitBtn = document.getElementById('submitBtn');

        // Validaciones finales
        let isValid = true;

        if (!this.validateTitulo(titulo)) {
            isValid = false;
        }

        if (this.currentTipo === 'Archivo' && !this.selectedFile) {
            this.showToast('Debes seleccionar un archivo', 'error');
            isValid = false;
        }

        if (this.currentTipo === 'Enlace') {
            const url = document.getElementById('urlInput')?.value.trim();
            if (!this.validateUrl(url)) {
                isValid = false;
            }
        }

        if (!isValid) {
            e.preventDefault();
            this.showToast('Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        // Mostrar estado de carga
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Creando Recurso...';
            submitBtn.disabled = true;
        }

        // Trackeo de analytics
        this.trackRecursoCreation();
    }

    handleKeyboardShortcuts(e) {
        // Cambiar tipo con Ctrl+1 (Archivo) y Ctrl+2 (Enlace)
        if (e.ctrlKey && e.key === '1') {
            e.preventDefault();
            this.selectTipo('Archivo');
        }
        
        if (e.ctrlKey && e.key === '2') {
            e.preventDefault();
            this.selectTipo('Enlace');
        }
        
        // Enviar formulario con Ctrl+Enter
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('recursoForm').dispatchEvent(new Event('submit'));
        }
        
        // Limpiar formulario con Ctrl+Shift+L
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            this.resetForm();
        }
    }

    trackRecursoCreation() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'recurso_creation_attempt', {
                'event_category': 'engagement',
                'event_label': 'recurso_create_form',
                'tipo': this.currentTipo
            });
        }
    }

    analyticsTracking() {
        console.log('Vista de Crear Recurso cargada - StudyHub Analytics');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'recurso_create_view', {
                'event_category': 'engagement',
                'event_label': 'recurso_create_page_loaded'
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
    new CrearRecursoStudyHub();
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
    console.error('Error en Crear Recurso StudyHub:', e.error);
});
