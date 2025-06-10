     
        
        
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            let casoId = urlParams.get('id');
            
            if (!casoId) {
                const pathParts = window.location.pathname.split('/');
                casoId = pathParts[pathParts.length - 1].replace('.html', '');
            }
            
            if (casoId && !isNaN(casoId)) {
                cargarDetallesCaso(casoId);
                cargarObservaciones(casoId);
                
                document.getElementById('form-nueva-observacion').addEventListener('submit', function(e) {
                    e.preventDefault();
                    agregarObservacion(casoId);
                });

                // Evento para cambiar estado
                document.getElementById('btn-cambiar-estado').addEventListener('click', function() {
                    cambiarEstado(casoId);
                });
            } else {
                mostrarError('ID de caso no válido o no proporcionado');
            }
        });

        function cargarDetallesCaso(casoId) {
            fetch(`/api/procesos/${casoId}`)
                .then(response => {
                    if (!response.ok) throw new Error('Error en la respuesta del servidor');
                    return response.json();
                })
                .then(data => {
                    renderizarDetallesCaso(data, casoId);
                    // Mostrar selector de estado y configurarlo
                    if (data.casos && data.casos.length > 0) {
                        const estadoActual = data.casos[0].estado;
                        configurarSelectorEstado(estadoActual);
                        actualizarEstadoEnUI(estadoActual);
                        document.getElementById('selector-estado-container').style.display = 'block';
                    }
                })
                .catch(error => {
                    mostrarError(`Error al cargar los datos: ${error.message}`);
                });
        }

        function configurarSelectorEstado(estadoActual) {
            const selector = document.getElementById('selector-estado');
            selector.value = estadoActual;
            
            // Configurar color según estado
            let color;
            switch(estadoActual) {
                case 'Abierto':
                    color = '#ffc107';
                    break;
                case 'En trámite':
                    color = '#17a2b8';
                    break;
                case 'Tramitado':
                    color = '#28a745';
                    break;
                default:
                    color = '#6c757d';
            }
            selector.style.backgroundColor = color;
            selector.style.color = 'white';
        }

        function cargarObservaciones(casoId) {
            fetch(`/api/procesos/${casoId}/observaciones`)
                .then(response => {
                    if (!response.ok) throw new Error('Error al cargar observaciones');
                    return response.json();
                })
                .then(data => {
                    renderizarObservaciones(data);
                })
                .catch(error => {
                    document.getElementById('observaciones-lista').innerHTML = 
                        `<p class="error">Error al cargar observaciones: ${error.message}</p>`;
                });
        }

        function agregarObservacion(casoId) {
            const textoObservacion = document.getElementById('nueva-observacion').value.trim();
            const btnEnviar = document.querySelector('#form-nueva-observacion button[type="submit"]');
            
            if (!textoObservacion) {
                mostrarAlerta('Por favor escribe una observación válida', 'error');
                return;
            }
            
            btnEnviar.disabled = true;
            btnEnviar.textContent = 'Enviando...';
            
            fetch(`/api/procesos/${casoId}/observaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    observacion: textoObservacion
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    document.getElementById('nueva-observacion').value = '';
                    cargarObservaciones(casoId);
                    mostrarAlerta('Observación guardada correctamente', 'success');
                } else {
                    throw new Error(data.error || 'Error desconocido');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarAlerta(error.message || 'Error al guardar la observación', 'error');
            })
            .finally(() => {
                btnEnviar.disabled = false;
                btnEnviar.textContent = 'Enviar Observación';
            });
        }

        function renderizarDetallesCaso(data, casoId) {
            const detalleDiv = document.getElementById('detalle-contacto');
            
            if (data.error) {
                detalleDiv.innerHTML = `<p class="error">${data.error}</p>`;
                return;
            }
            
            let htmlContent = `
                <div class="info-contacto">
                    <h3> N° ${data.casonumero || casoId}</h3>
            `;
            
            if (data.nombre || data.apellido) {
                htmlContent += `<p><strong>Cliente:</strong> ${data.nombre || ''} ${data.apellido || ''}</p>`;
            }
            
            htmlContent += `</div>`;
            
            if (data.casos && data.casos.length > 0) {
                htmlContent += `
                    <div class="contenedor-tabla">
                        <h3>Detalles</h3>
                        <table class="tabla-casos">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Fecha Creación</th>
                                    <th>fecha ultima Gestion</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.casos.map(caso => `
                                    <tr>
                                        <td>${caso.tipo || 'N/A'}</td>
                                       
                                        <td>${caso.fecha_creacion ? new Date(caso.fecha_creacion).toLocaleDateString() : 'N/A'}</td>
                                        <td>${caso.fecha_actualizacion ? new Date(caso.fecha_actualizacion).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                htmlContent += '<p class="sin-casos">No se encontraron detalles adicionales</p>';
            }
            
            detalleDiv.innerHTML = htmlContent;
        }

        function renderizarObservaciones(observaciones) {
            const contenedor = document.getElementById('observaciones-lista');
            
            if (!observaciones || observaciones.length === 0) {
                contenedor.innerHTML = '<p class="sin-casos">No hay observaciones registradas</p>';
                return;
            }
            
            let html = observaciones.map(obs => `
                <div class="observacion-item">
                    <div class="observacion-usuario">${obs.usuario || 'Sistema'}</div>
                    <div class="observacion-texto">${obs.texto}</div>
                    <div class="observacion-fecha">
                        ${new Date(obs.fecha).toLocaleString()}
                    </div>
                </div>
            `).join('');
            
            contenedor.innerHTML = html;
        }

        function mostrarError(mensaje) {
            document.getElementById('detalle-contacto').innerHTML = 
                `<p class="error">${mensaje}</p>`;
        }

        function mostrarAlerta(mensaje, tipo = 'error') {
            // Eliminar alertas anteriores
            const alertasAnteriores = document.querySelectorAll('.alerta');
            alertasAnteriores.forEach(alerta => alerta.remove());
            
            const alerta = document.createElement('div');
            alerta.className = `alerta ${tipo}`;
            alerta.textContent = mensaje;
            document.body.appendChild(alerta);
            
            setTimeout(() => {
                alerta.remove();
            }, 5000);
        }

        async function cambiarEstado(casoId) {
            const selector = document.getElementById('selector-estado');
            const nuevoEstado = selector.value;
            const btnCambiarEstado = document.getElementById('btn-cambiar-estado');
            
            try {
                btnCambiarEstado.disabled = true;
                btnCambiarEstado.textContent = 'Actualizando...';
                
                const response = await fetch(`/api/procesos/${casoId}/estado`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ estado: nuevoEstado })
                });

                // Verificar si la respuesta es JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    throw new Error(`Respuesta inesperada del servidor: ${text.substring(0, 100)}`);
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al actualizar el estado');
                }

                // Actualizar la UI con el nuevo estado
                actualizarEstadoEnUI(nuevoEstado);
                configurarSelectorEstado(nuevoEstado);
                mostrarAlerta('Estado actualizado correctamente', 'success');

                // Opcional: Recargar observaciones para mostrar la automática
                cargarObservaciones(casoId);

            } catch (error) {
                console.error('Error:', error);
                mostrarAlerta(error.message, 'error');
            } finally {
                btnCambiarEstado.disabled = false;
                btnCambiarEstado.textContent = 'Actualizar Estado';
            }
        }

        function actualizarEstadoEnUI(nuevoEstado) {
            const estadoActualElement = document.getElementById('estado-actual');
            let badgeClass, color;
            
            switch(nuevoEstado.toLowerCase()) {
                case 'pendiente':
                    badgeClass = 'badge-pendiente';
                    color = '#ffc107';
                    break;
                case 'en trámite':
                    badgeClass = 'badge-en-tramite';
                    color = '#17a2b8';
                    break;
                case 'tramitado':
                    badgeClass = 'badge-tramitado';
                    color = '#28a745';
                    break;
                default:
                    badgeClass = 'badge-pendiente';
                    color = '#6c757d';
            }
            
            estadoActualElement.innerHTML = `
                <p><strong>Estado actual:</strong> 
                <span class="badge-estado ${badgeClass}">${nuevoEstado}</span></p>
            `;
            
            // Actualizar también el color del selector
            const selector = document.getElementById('selector-estado');
            selector.style.backgroundColor = color;
            selector.style.color = 'white';
        }

// En tu detalle-caso.js
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const casoId = urlParams.get('id');
    
    // Configurar enlace de Casos
    const linkCasos = document.getElementById('link-casos');
    
    linkCasos.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (casoId) {
            // Si hay un ID, recarga los datos del caso
            cargarDetallesCaso(casoId);
        } else {
            // Si no hay ID, muestra lista de casos
            cargarListaCasos();
        }
    });
});

function cargarListaCasos() {
    fetch('/api/casos')
        .then(response => response.json())
        .then(data => {
            document.getElementById('detalle-contacto').innerHTML = `
                <h3>Mis Casos</h3>
                <div class="lista-casos">
                    ${data.map(caso => `
                        <div class="caso-item">
                            <h4>Caso #${caso.id}: ${caso.titulo}</h4>
                            <p><strong>Estado:</strong> <span class="badge-estado ${getEstadoClass(caso.estado)}">${caso.estado}</span></p>
                            <p><strong>Fecha:</strong> ${new Date(caso.fecha).toLocaleDateString()}</p>
                            <a href="/detalle-caso?id=${caso.id}" class="btn-ver">Ver detalle</a>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Ocultar secciones no necesarias
            document.getElementById('selector-estado-container').style.display = 'none';
            document.querySelector('.seccion-observaciones').style.display = 'none';
        });
}

function getEstadoClass(estado) {
    const estados = {
        'Pendiente': 'badge-pendiente',
        'En trámite': 'badge-en-tramite',
        'Tramitado': 'badge-tramitado'
    };
    return estados[estado] || 'badge-pendiente';
}

document.getElementById('btn-casos').addEventListener('click', function(e) {
    e.preventDefault(); // Evita la recarga de página
    
    // Obtiene el ID del caso actual de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const casoId = urlParams.get('id');
    
    if (casoId) {
        // Si estamos viendo un caso específico, recarga solo los datos
        cargarDetallesCaso(casoId); // Usa tu función existente
        
        // Opcional: Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Si no hay ID, muestra la lista general de casos
        window.location.href = '/casos'; // O usa AJAX para cargar la lista
    }
});

document.getElementById('btn-casos').addEventListener('click', function(e) {
    e.preventDefault(); // Evita la recarga de página
    
    // Obtiene el ID del caso actual de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const casoId = urlParams.get('id');
    
    if (casoId) {
        // Si estamos viendo un caso específico, recarga solo los datos
        cargarDetallesCaso(casoId); // Usa tu función existente
        
        // Opcional: Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Si no hay ID, muestra la lista general de casos
        window.location.href = '/casos'; // O usa AJAX para cargar la lista
    }
});

     // Resaltar el ítem del menú activo
    document.addEventListener('DOMContentLoaded', function() {
        const currentPage = window.location.pathname.split('/')[1] || 'detalle-caso';
        const menuItems = document.querySelectorAll('.submenu a');
        
        menuItems.forEach(item => {
            const itemPage = item.getAttribute('href').replace('/', '');
            if (currentPage === itemPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    })  