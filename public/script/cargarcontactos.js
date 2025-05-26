function cargarContactos() {
  const estadoSeleccionado = document.getElementById('filtro-estado').value;

  fetch('/api/contactos')
    .then(response => response.json())
    .then(data => {
      const tabla = document.getElementById('tabla-contactos');
      tabla.innerHTML = '';

      data
        .filter(contacto => estadoSeleccionado === 'Todos' || contacto.estado === estadoSeleccionado)
        .forEach(contacto => {
          let color = '';
          switch (contacto.estado) {
            case 'Pendiente': color = '#dc3545'; break; // Rojo
            case 'En trámite': color = '#fd7e14'; break; // Naranja
            case 'Tramitado': color = '#28a745'; break; // Verde
            default: color = '#6c757d'; // Gris
          }

          tabla.innerHTML += `
            <tr>
              <td>${contacto.id}</td> 
              <td>${formatearFecha(contacto.timestamp)}</td> 
              <td>${contacto.nombre}</td>
              <td>${contacto.apellido}</td>
              <td>${contacto.email}</td>
              <td>${contacto.telefono}</td>
              <td>${contacto.paisorigen}</td>
              <td>${contacto.tipocaso}</td>
              <td class="mensaje-cell">${contacto.comentario}</td>
              <td>
                <textarea id="obs-${contacto.id}" class="form-control">${contacto.observaciones || ''}</textarea>
              </td>
              <td ; color: white;">
                <select onchange="actualizarEstado(${contacto.id}, this.value)" class="form-control" style="background-color: ${color}; color: white;">
                  <option value="Pendiente" ${contacto.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="En trámite" ${contacto.estado === 'En trámite' ? 'selected' : ''}>En trámite</option>
                  <option value="Tramitado" ${contacto.estado === 'Tramitado' ? 'selected' : ''}>Tramitado</option>
                </select>
              </td>
              <td>
                <button onclick="guardarObservacion(${contacto.id})" class="form-control" style="background-color: blue; color: white;">
                  <i class="fas fa-save"></i> Actualizar
                </button>
              </td>
            </tr>`;
        });
    })
    .catch(err => {
      console.error('Error:', err);
      mostrarError('Error al cargar los contactos');
    });
}

// Función para formatear la fecha
function formatearFecha(timestamp) {
  if (!timestamp) return '';
  const fecha = new Date(timestamp);
  return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function guardarObservacion(id) {
  const texto = document.getElementById(`obs-${id}`).value.trim();

  if (!texto) {
    mostrarError('Por favor ingrese una observación válida');
    return;
  }

  mostrarCargando(true);
  
  fetch('/guardar-observacion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, observacion: texto })
  })
  .then(res => {
    if (!res.ok) throw new Error('Error al guardar');
    return res.text();
  })
  .then(msg => {
    mostrarExito('Observación guardada correctamente');
  })
  .catch(err => {
    console.error('Error al guardar:', err);
    mostrarError('Error al guardar la observación: ' + err.message);
  })
  .finally(() => {
    mostrarCargando(false);
  });
}

function actualizarEstado(id, nuevoEstado) {
  mostrarCargando(true);
  
  fetch('/actualizar-estado', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, estado: nuevoEstado })
  })
  .then(res => {
    if (!res.ok) throw new Error('Error al actualizar');
    return res.text();
  })
  .then(msg => {
    console.log(msg);
    cargarContactos();
  })
  .catch(err => {
    console.error('Error:', err);
    mostrarError('Error al actualizar el estado');
  })
  .finally(() => {
    mostrarCargando(false);
  });
}


function mostrarCargando(mostrar) {
  const loader = document.getElementById('loader') || crearLoader();
  loader.style.display = mostrar ? 'flex' : 'none';
}

function crearLoader() {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.style.position = 'fixed';
  loader.style.top = '0';
  loader.style.left = '0';
  loader.style.width = '100%';
  loader.style.height = '100%';
  loader.style.backgroundColor = 'rgba(17, 17, 17, 0.5)';
  loader.style.display = 'none';
  loader.style.justifyContent = 'center';
  loader.style.alignItems = 'center';
  loader.style.zIndex = '9999';
  loader.innerHTML = `
    <div class="spinner-border text-light" role="status">
      <span class="visually-hidden">Cargando...</span>
    </div>
  `;
  document.body.appendChild(loader);
  return loader;
}

function mostrarExito(mensaje) {
  // Implementar notificación de éxito
  alert(mensaje);
}

function mostrarError(mensaje) {
  // Implementar notificación de error
  alert(mensaje);
}

// Cargar la tabla al iniciar
document.addEventListener('DOMContentLoaded', cargarContactos);