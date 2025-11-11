// Funcionalidad específica para la vista Index de Cursos - StudyHub
class CursosIndex {
    constructor() {
        this.cursos = [];
        this.vistaActual = 'grid';
        this.filtros = {
            busqueda: '',
            estado: 'todos',
            orden: 'nombre'
        };
        this.esProfesor = false;
        this.init();
    }
    
    init() {
        this.detectarRolUsuario();
        this.cargarCursos();
        this.setupEventListeners();
        this.setupVistas();
        this.aplicarFiltros();
    }
    
    detectarRolUsuario() {
        // Determinar si el usuario es profesor basado en la UI
        this.esProfesor = document.querySelector('.btn-group')?.innerHTML.includes('Gestionar estudiantes') || false;
    }
    
    cargarCursos() {
        // Recopilar datos de cursos del HTML
        const elementosCursosGrid = document.querySelectorAll('.curso-card');
        const elementosCursosLista = document.querySelectorAll('.curso-list-item');
        
        this.cursos = Array.from(elementosCursosGrid).map((elemento, index) => {
            const elementoLista = elementosCursosLista[index];
            return {
                elementoGrid: elemento,
                elementoLista: elementoLista,
                estado: elemento.dataset.estado,
                nombre: elemento.dataset.nombre || '',
                codigo: elemento.dataset.codigo || '',
                clases: parseInt(elemento.querySelector('.meta-item small')?.textContent.match(/\d+/)?.[0] || 0),
                estudiantes: parseInt(Array.from(elemento.querySelectorAll('.meta-item small'))[1]?.textContent.match(/\d+/)?.[0] || 0)
            };
        });
    }
    
    setupEventListeners() {
        // Búsqueda en tiempo real
        const inputBusqueda = document.getElementById('inputBusqueda');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', (e) => {
                this.filtros.busqueda = e.target.value.toLowerCase();
                this.aplicarFiltros();
            });
        }
        
        // Filtro por estado
        const filtroEstado = document.getElementById('filtroEstado');
        if (filtroEstado) {
            filtroEstado.addEventListener('change', (e) => {
                this.filtros.estado = e.target.value;
                this.aplicarFiltros();
            });
        }
        
        // Reset de filtros
        const btnReset = document.getElementById('btnResetFiltros');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.resetFiltros();
            });
        }
        
        // Cambio de vista (grid/lista)
        this.setupCambioVista();
        
        // Ordenamiento
        this.setupOrdenamiento();
        
        // Acciones rápidas para profesores
        this.setupAccionesRapidas();
        
        // Tarjetas de estadísticas clickeables
        this.setupEstadisticasInteractivas();
        
        // Favoritos para estudiantes
        this.setupFavoritos();
    }
    
    setupCambioVista() {
        const radiosVista = document.querySelectorAll('input[name="btnViewType"]');
        radiosVista.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.cambiarVista(e.target.id === 'btnViewGrid' ? 'grid' : 'lista');
            });
        });
    }
    
    setupOrdenamiento() {
        const dropdownItems = document.querySelectorAll('.dropdown-item[data-orden]');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const orden = e.target.dataset.orden;
                this.ordenarCursos(orden);
                
                // Actualizar texto del dropdown
                const dropdownToggle = document.querySelector('.dropdown-toggle');
                dropdownToggle.innerHTML = `<i class="bi bi-funnel"></i>`;
            });
        });
    }
    
    setupAccionesRapidas() {
        // Exportar cursos
        const btnExportar = document.getElementById('btnExportarCursos');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.exportarCursos();
            });
        }
        
        // Ver estadísticas
        const btnEstadisticas = document.getElementById('btnVerEstadisticas');
        if (btnEstadisticas) {
            btnEstadisticas.addEventListener('click', () => {
                this.mostrarEstadisticas();
            });
        }
    }
    
    setupEstadisticasInteractivas() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.filtrarPorEstadistica(e.currentTarget);
            });
        });
    }
    
    setupFavoritos() {
        const botonesFavorito = document.querySelectorAll('.btn-outline-secondary[title="Marcar como favorito"]');
        botonesFavorito.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleFavorito(e.target.closest('button'));
            });
        });
    }
    
    cambiarVista(vista) {
        this.vistaActual = vista;
        
        if (vista === 'grid') {
            document.getElementById('vistaGrid').classList.remove('vista-oculta');
            document.getElementById('vistaGrid').classList.add('vista-activa');
            document.getElementById('vistaLista').classList.remove('vista-activa');
            document.getElementById('vistaLista').classList.add('vista-oculta');
        } else {
            document.getElementById('vistaLista').classList.remove('vista-oculta');
            document.getElementById('vistaLista').classList.add('vista-activa');
            document.getElementById('vistaGrid').classList.remove('vista-activa');
            document.getElementById('vistaGrid').classList.add('vista-oculta');
        }
    }
    
    aplicarFiltros() {
        let cursosVisibles = 0;
        
        this.cursos.forEach(curso => {
            let mostrar = true;
            
            // Filtro por búsqueda
            if (this.filtros.busqueda) {
                const textoBusqueda = this.filtros.busqueda;
                const coincideNombre = curso.nombre.includes(textoBusqueda);
                const coincideCodigo = curso.codigo.includes(textoBusqueda);
                
                if (!(coincideNombre || coincideCodigo)) {
                    mostrar = false;
                }
            }
            
            // Filtro por estado
            if (this.filtros.estado !== 'todos' && curso.estado !== this.filtros.estado) {
                mostrar = false;
            }
            
            if (mostrar) {
                curso.elementoGrid.classList.remove('filtrado');
                curso.elementoGrid.classList.add('mostrar');
                if (curso.elementoLista) {
                    curso.elementoLista.classList.remove('filtrado');
                    curso.elementoLista.classList.add('mostrar');
                }
                cursosVisibles++;
            } else {
                curso.elementoGrid.classList.add('filtrado');
                curso.elementoGrid.classList.remove('mostrar');
                if (curso.elementoLista) {
                    curso.elementoLista.classList.add('filtrado');
                    curso.elementoLista.classList.remove('mostrar');
                }
            }
        });
        
        // Actualizar contadores
        document.getElementById('contadorCursos').textContent = cursosVisibles;
        document.getElementById('contadorVisible').textContent = cursosVisibles;
        
        // Mostrar/ocultar estados vacíos
        this.actualizarEstadoVacio(cursosVisibles);
    }
    
    actualizarEstadoVacio(cursosVisibles) {
        const emptyState = document.getElementById('emptyState');
        const gridCursos = document.getElementById('gridCursos');
        const listaCursos = document.getElementById('listaCursos');
        
        if (cursosVisibles === 0 && this.cursos.length > 0) {
            emptyState.classList.remove('d-none');
            gridCursos.classList.add('d-none');
            listaCursos.classList.add('d-none');
        } else {
            emptyState.classList.add('d-none');
            if (this.vistaActual === 'grid') {
                gridCursos.classList.remove('d-none');
                listaCursos.classList.add('d-none');
            } else {
                gridCursos.classList.add('d-none');
                listaCursos.classList.remove('d-none');
            }
        }
        
        // Mostrar estado vacío inicial si no hay cursos
        if (this.cursos.length === 0) {
            emptyState.classList.remove('d-none');
            gridCursos.classList.add('d-none');
            listaCursos.classList.add('d-none');
        }
    }
    
    resetFiltros() {
        document.getElementById('inputBusqueda').value = '';
        document.getElementById('filtroEstado').value = 'todos';
        this.filtros.busqueda = '';
        this.filtros.estado = 'todos';
        this.aplicarFiltros();
    }
    
    filtrarPorEstadistica(card) {
        const statLabel = card.querySelector('.stat-label').textContent.trim();
        
        switch(statLabel) {
            case 'Cursos Activos':
                document.getElementById('filtroEstado').value = 'activo';
                this.filtros.estado = 'activo';
                break;
            case 'Cursos Totales':
                this.resetFiltros();
                break;
            default:
                // Para otras estadísticas, solo reseteamos
                this.resetFiltros();
        }
        
        this.aplicarFiltros();
        
        // Efecto visual
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }
    
    ordenarCursos(orden) {
        // Reordenar lógica según el criterio seleccionado
        // En una implementación real, esto reordenaría los elementos DOM
        console.log(`Ordenando cursos por: ${orden}`);
        this.mostrarMensaje(`Cursos ordenados por ${orden}`, 'info');
    }
    
    exportarCursos() {
        this.mostrarMensaje('Preparando exportación de cursos...', 'info');
        
        setTimeout(() => {
            const modalHTML = `
                <div class="modal fade" id="exportModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-download me-2"></i>Exportar Lista de Cursos
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Formato de exportación:</label>
                                    <select class="form-select" id="exportFormat">
                                        <option value="excel">Excel (.xlsx)</option>
                                        <option value="csv">CSV (.csv)</option>
                                        <option value="pdf">PDF (.pdf)</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Incluir:</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="includeClases" checked>
                                        <label class="form-check-label" for="includeClases">Información de clases</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="includeEstudiantes" checked>
                                        <label class="form-check-label" for="includeEstudiantes">Lista de estudiantes</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="includeSesiones">
                                        <label class="form-check-label" for="includeSesiones">Sesiones programadas</label>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" id="confirmExport">
                                    <i class="bi bi-download me-2"></i>Descargar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const modalElement = document.getElementById('exportModal');
            const modal = new bootstrap.Modal(modalElement);
            
            document.getElementById('confirmExport').addEventListener('click', () => {
                modal.hide();
                this.procesarExportacion();
            });
            
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            });
            
            modal.show();
        }, 1000);
    }
    
    procesarExportacion() {
        this.mostrarMensaje('Generando archivo de exportación...', 'info');
        
        setTimeout(() => {
            this.mostrarMensaje('¡Exportación completada! El archivo se ha descargado.', 'success');
        }, 2000);
    }
    
    mostrarEstadisticas() {
        this.mostrarMensaje('Cargando estadísticas avanzadas...', 'info');
        
        // En una implementación real, esto mostraría un modal con gráficos
        setTimeout(() => {
            this.mostrarMensaje('Funcionalidad de estadísticas avanzadas - Próximamente', 'info');
        }, 1500);
    }
    
    toggleFavorito(btn) {
        const esFavorito = btn.classList.contains('btn-warning');
        
        if (esFavorito) {
            btn.classList.remove('btn-warning');
            btn.classList.add('btn-outline-secondary');
            btn.innerHTML = '<i class="bi bi-star"></i>';
            this.mostrarMensaje('Curso removido de favoritos', 'info');
        } else {
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-warning');
            btn.innerHTML = '<i class="bi bi-star-fill"></i>';
            this.mostrarMensaje('Curso agregado a favoritos', 'success');
        }
    }
    
    mostrarMensaje(mensaje, tipo = 'info') {
        // Crear o reutilizar contenedor de mensajes
        let alertContainer = document.getElementById('alertMessages');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'alertMessages';
            alertContainer.className = 'position-fixed top-0 end-0 p-3';
            alertContainer.style.zIndex = '1060';
            document.body.appendChild(alertContainer);
        }
        
        const alertId = 'alert-' + Date.now();
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <i class="bi ${this.obtenerIconoAlerta(tipo)} me-2"></i>
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }
    
    obtenerIconoAlerta(tipo) {
        const iconos = {
            'success': 'bi-check-circle-fill',
            'error': 'bi-exclamation-triangle-fill',
            'warning': 'bi-exclamation-triangle-fill',
            'info': 'bi-info-circle-fill'
        };
        return iconos[tipo] || 'bi-info-circle-fill';
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    new CursosIndex();
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la vista index de cursos:', e.error);
});