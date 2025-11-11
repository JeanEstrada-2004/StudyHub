// View-specific scripts for Mensajes/Index
// Funcionalidad específica para el Foro de Mensajes - StudyHub
class ForoMensajesStudyHub {
    constructor() {
        this.isLoading = false;
        this.currentSort = 'newest';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupAutoRefresh();
        this.setupCharacterCounter();
        this.analyticsTracking();
    }

    setupEventListeners() {
        // Botón de actualizar foro
        const refreshBtn = document.getElementById('refreshForo');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshForo();
            });
        }

        // Ordenamiento de mensajes
        const sortLinks = document.querySelectorAll('[data-sort]');
        sortLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.sortMensajes(link.dataset.sort);
            });
        });

        // Botones de like
        const likeButtons = document.querySelectorAll('.like-btn');
        likeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLike(btn);
            });
        });

        // Botones de responder
        const replyButtons = document.querySelectorAll('.reply-btn');
        replyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.replyToMensaje(btn);
            });
        });

        // Botones de reportar
        const reportButtons = document.querySelectorAll('.report-btn');
        reportButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.reportMensaje(btn);
            });
        });

        // Validación del formulario
        const mensajeForm = document.getElementById('mensajeForm');
        if (mensajeForm) {
            mensajeForm.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Auto-focus en textarea si hay parámetros específicos
        this.handleUrlParameters();
    }

    setupAnimations() {
        // Animación escalonada para los mensajes
        const mensajeCards = document.querySelectorAll('.mensaje-card');
        mensajeCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });

        // Animación para el formulario
        const formCard = document.querySelector('.card:first-child');
        if (formCard) {
            formCard.style.opacity = '0';
            formCard.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                formCard.style.transition = 'all 0.5s ease';
                formCard.style.opacity = '1';
                formCard.style.transform = 'scale(1)';
            }, 50);
        }
    }

    setupAutoRefresh() {
        // Auto-refresh cada 2 minutos (120000 ms) si la página está visible
        setInterval(() => {
            if (document.visibilityState === 'visible' && !this.isLoading) {
                this.refreshForo(true); // true = auto-refresh
            }
        }, 120000);
    }

    setupCharacterCounter() {
        const textarea = document.getElementById('contenido');
        const charCount = document.getElementById('charCount');
        
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const length = textarea.value.length;
                charCount.textContent = length;
                
                // Cambiar color según la longitud
                if (length > 900) {
                    charCount.className = 'danger';
                } else if (length > 800) {
                    charCount.className = 'warning';
                } else {
                    charCount.className = '';
                }
            });
            
            // Inicializar contador
            charCount.textContent = textarea.value.length;
        }
    }

    async refreshForo(isAutoRefresh = false) {
        if (this.isLoading) return;

        this.isLoading = true;
        const refreshBtn = document.getElementById('refreshForo');
        
        if (refreshBtn && !isAutoRefresh) {
            refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Actualizando...';
            refreshBtn.disabled = true;
        }

        try {
            // Simular recarga (en producción sería una petición AJAX)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (!isAutoRefresh) {
                window.location.reload();
            } else {
                console.log('Foro actualizado automáticamente');
            }
        } catch (error) {
            console.error('Error al actualizar foro:', error);
            this.showToast('Error al actualizar el foro', 'error');
        } finally {
            this.isLoading = false;
            if (refreshBtn && !isAutoRefresh) {
                refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Actualizar foro';
                refreshBtn.disabled = false;
            }
        }
    }

    sortMensajes(sortType) {
        if (this.currentSort === sortType) return;
        
        this.currentSort = sortType;
        const mensajesList = document.getElementById('mensajesList');
        const mensajes = Array.from(mensajesList.querySelectorAll('.mensaje-card'));
        
        // Actualizar UI del dropdown
        document.querySelectorAll('[data-sort]').forEach(link => {
            link.classList.toggle('active', link.dataset.sort === sortType);
        });
        
        // Ordenar mensajes
        mensajes.sort((a, b) => {
            const aTime = parseInt(a.dataset.timestamp);
            const bTime = parseInt(b.dataset.timestamp);
            
            return sortType === 'newest' ? bTime - aTime : aTime - bTime;
        });
        
        // Re-insertar mensajes en orden
        mensajes.forEach(mensaje => {
            mensajesList.appendChild(mensaje);
        });
        
        this.showToast(`Mensajes ordenados por ${sortType === 'newest' ? 'más recientes' : 'más antiguos'}`, 'info');
    }

    toggleLike(button) {
        const mensajeId = button.dataset.mensajeId;
        const likeCount = button.querySelector('span');
        
        button.classList.toggle('active');
        
        if (button.classList.contains('active')) {
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
            this.showToast('Like agregado', 'success');
        } else {
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
            this.showToast('Like removido', 'info');
        }
        
        // Aquí iría la llamada AJAX para guardar el like
        this.trackLike(mensajeId, button.classList.contains('active'));
    }

    replyToMensaje(button) {
        const mensajeId = button.dataset.mensajeId;
        const mensajeCard = button.closest('.mensaje-card');
        const usuarioNombre = mensajeCard.querySelector('h6').textContent;
        const textarea = document.getElementById('contenido');
        
        // Agregar mención al textarea
        const mencion = `@${usuarioNombre} `;
        textarea.value = mencion + textarea.value;
        textarea.focus();
        
        this.showToast(`Respondiendo a ${usuarioNombre}`, 'info');
    }

    reportMensaje(button) {
        const mensajeId = button.dataset.mensajeId;
        
        // Mostrar modal de reporte
        this.showReportModal(mensajeId);
    }

    showReportModal(mensajeId) {
        const modalHtml = `
            <div class="modal fade" id="reportModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-flag text-danger me-2"></i>
                                Reportar Mensaje
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-muted mb-3">
                                ¿Por qué deseas reportar este mensaje? Esta acción notificará a los administradores del curso.
                            </p>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="reportReason" id="spam" value="spam">
                                <label class="form-check-label" for="spam">
                                    Spam o publicidad no deseada
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="reportReason" id="inappropriate" value="inappropriate">
                                <label class="form-check-label" for="inappropriate">
                                    Contenido inapropiado u ofensivo
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="reportReason" id="offtopic" value="offtopic">
                                <label class="form-check-label" for="offtopic">
                                    Fuera del tema del curso
                                </label>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="radio" name="reportReason" id="other" value="other">
                                <label class="form-check-label" for="other">
                                    Otro motivo
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="reportDetails" class="form-label">Detalles adicionales (opcional):</label>
                                <textarea class="form-control" id="reportDetails" rows="3" 
                                          placeholder="Proporciona más información sobre tu reporte..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="confirmReport">Enviar Reporte</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente
        const existingModal = document.getElementById('reportModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById('reportModal'));
        modal.show();

        // Configurar evento de confirmación
        document.getElementById('confirmReport').addEventListener('click', () => {
            this.submitReport(mensajeId);
            modal.hide();
        });
    }

    submitReport(mensajeId) {
        const reason = document.querySelector('input[name="reportReason"]:checked')?.value;
        const details = document.getElementById('reportDetails')?.value;
        
        if (!reason) {
            this.showToast('Por favor selecciona un motivo', 'error');
            return;
        }
        
        // Simular envío de reporte
        setTimeout(() => {
            this.showToast('Reporte enviado correctamente', 'success');
        }, 1000);
        
        console.log('Reporte enviado:', { mensajeId, reason, details });
    }

    handleFormSubmit(e) {
        const textarea = document.getElementById('contenido');
        const submitBtn = document.getElementById('submitBtn');
        
        if (!textarea.value.trim()) {
            e.preventDefault();
            this.showToast('Por favor escribe un mensaje', 'error');
            textarea.focus();
            return;
        }
        
        if (textarea.value.length > 1000) {
            e.preventDefault();
            this.showToast('El mensaje no puede tener más de 1000 caracteres', 'error');
            return;
        }
        
        // Mostrar estado de carga
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Publicando...';
            submitBtn.disabled = true;
        }
    }

    handleKeyboardShortcuts(e) {
        // Nuevo mensaje con Ctrl+Enter en el textarea
        if (e.ctrlKey && e.key === 'Enter' && e.target.id === 'contenido') {
            e.preventDefault();
            document.getElementById('mensajeForm').dispatchEvent(new Event('submit'));
        }
        
        // Focus en búsqueda con Ctrl+F
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            document.getElementById('contenido').focus();
        }
        
        // Recargar con F5
        if (e.key === 'F5') {
            e.preventDefault();
            this.refreshForo();
        }
    }

    handleUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('focus') === 'true') {
            document.getElementById('contenido').focus();
        }
    }

    trackLike(mensajeId, isLiked) {
        if (typeof gtag !== 'undefined') {
            gtag('event', isLiked ? 'message_like' : 'message_unlike', {
                'event_category': 'engagement',
                'event_label': 'foro_interaction'
            });
        }
    }

    analyticsTracking() {
        console.log('Foro de mensajes cargado - StudyHub Analytics');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'forum_view', {
                'event_category': 'engagement',
                'event_label': 'forum_loaded'
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

// Funciones globales para acciones rápidas
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new ForoMensajesStudyHub();
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
    console.error('Error en Foro de Mensajes StudyHub:', e.error);
});