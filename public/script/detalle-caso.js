document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const casoId = urlParams.get("id");
  const idUsuario = urlParams.get("id_usuario");


  


  if (!casoId) {
    const pathParts = window.location.pathname.split("/");
    casoId = pathParts[pathParts.length - 1];
  }

  if (casoId && !isNaN(casoId)) {
    cargarDetallesCaso(casoId);
    cargarObservaciones(casoId);

    // Configurar formulario de observaciones
    const formObservacion = document.getElementById("form-nueva-observacion");
    if (formObservacion) {
      formObservacion.addEventListener("submit", function (e) {
        e.preventDefault();
        agregarObservacion(casoId);
      });
    }

    // Configurar botón de cambio de estado
    const btnEstado = document.getElementById("btn-cambiar-estado");
    if (btnEstado) {
      btnEstado.addEventListener("click", function () {
        cambiarEstado(casoId);
      });
    }

    // Configurar formulario de documentos
    const formDocumento = document.getElementById("formDocumento");
    if (formDocumento) {
      formDocumento.addEventListener("submit", function (e) {
        e.preventDefault();
        subirDocumento(casoId);
      });
    }
  } else {
    mostrarError("ID de caso no válido o no proporcionado");
  }
});

// Función para subir documento
async function subirDocumento(casoId) {
  const nombreDocumento = document.getElementById("nombre").value;
  const fileInput = document.getElementById("adjuntos");
  const btnSubmit = document.querySelector(
    "#formDocumento button[type='submit']"
  );

  if (!nombreDocumento || !fileInput.files[0]) {
    mostrarAlerta("Por favor complete todos los campos", "error");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';

  try {
    // 1. Crear formData con los datos del formulario
    const formData = new FormData();
    formData.append("nombre", nombreDocumento);
    formData.append("adjuntos", fileInput.files[0]);

    // Obtener el ID del usuario desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idUsuario = urlParams.get("id_usuario");

    //  Adjuntar id_usuario al FormData
    formData.append("id_usuario", idUsuario);

    // 2. Enviar archivo al servidor
    const responseUpload = await fetch(`/api/procesos/${casoId}/documentos`, {
      method: "POST",
      body: formData,
    });

    if (!responseUpload.ok) {
      const errorData = await responseUpload.json();
      throw new Error(errorData.message || "Error al subir el documento");
    }

    // 3. Crear observación automática
    const observacion = `Se ha subido el documento: ${nombreDocumento}`;
    const responseObs = await fetch(`/api/procesos/${casoId}/observaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observacion }),
    });

    if (!responseObs.ok) {
      throw new Error(
        "Documento subido pero no se pudo registrar la observación"
      );
    }

    // 4. Actualizar la interfaz
    mostrarAlerta("Documento subido correctamente", "success");
    document.getElementById("formDocumento").reset();
    cargarObservaciones(casoId);
  } catch (error) {
    console.error("Error:", error);
    mostrarAlerta(error.message, "error");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '<i class="fas fa-upload"></i> Subir documento';
  }
}



// Función para cargar detalles del caso
function cargarDetallesCaso(casoId) {
  fetch(`/api/procesos/${casoId}`)
    .then((response) => {
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      return response.json();
    })
    .then((data) => {
      renderizarDetallesCaso(data, casoId);
      if (data.casos && data.casos.length > 0) {
        const estadoActual = data.casos[0].estado;
        configurarSelectorEstado(estadoActual);
        actualizarEstadoEnUI(estadoActual);
        document.getElementById("selector-estado-container").style.display =
          "block";
      }
    })
    .catch((error) => {
      mostrarError(`Error al cargar los datos: ${error.message}`);
    });
}

function configurarSelectorEstado(estadoActual) {
  const selector = document.getElementById("selector-estado");
  if (!selector) return;
  selector.value = estadoActual;

  let color;
  switch (estadoActual) {
    case "Abierto":
      color = "#ffc107";
      break;
    case "En trámite":
      color = "#17a2b8";
      break;
    case "Tramitado":
      color = "#28a745";
      break;
    default:
      color = "#6c757d";
  }
  selector.style.backgroundColor = color;
  selector.style.color = "white";
}

function cargarObservaciones(casoId) {
  fetch(`/api/procesos/${casoId}/observaciones`)
    .then((response) => {
      if (!response.ok) throw new Error("Error al cargar observaciones");
      return response.json();
    })
    .then(renderizarObservaciones)
    .catch((error) => {
      document.getElementById(
        "observaciones-lista"
      ).innerHTML = `<p class="error">Error al cargar observaciones: ${error.message}</p>`;
    });
}

function agregarObservacion(casoId) {
  const textoObservacion = document
    .getElementById("nueva-observacion")
    .value.trim();
  const btnEnviar = document.querySelector(
    '#form-nueva-observacion button[type="submit"]'
  );

  if (!textoObservacion) {
    mostrarAlerta("Por favor escribe una observación válida", "error");
    return;
  }

  btnEnviar.disabled = true;
  btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

  fetch(`/api/procesos/${casoId}/observaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ observacion: textoObservacion }),
  })
    .then((response) => {
      if (!response.ok)
        return response.json().then((err) => {
          throw err;
        });
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        document.getElementById("nueva-observacion").value = "";
        cargarObservaciones(casoId);
        mostrarAlerta("Observación guardada correctamente", "success");
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      mostrarAlerta(
        error.message || "Error al guardar la observación",
        "error"
      );
    })
    .finally(() => {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML =
        '<i class="fas fa-paper-plane"></i> Enviar Observación';
    });
}

function renderizarDetallesCaso(data, casoId) {
  const detalleDiv = document.getElementById("detalle-contacto");
  if (data.error) {
    detalleDiv.innerHTML = `<p class="error">${data.error}</p>`;
    return;
  }

  let htmlContent = `
      <div class="info-contacto">
          <h3> N° ${data.casonumero || casoId}</h3>
          ${
            data.nombre || data.apellido
              ? `<p><strong>Cliente:</strong> ${data.nombre || ""} ${
                  data.apellido || ""
                }</p>`
              : ""
          }
      </div>`;

  if (data.casos && data.casos.length > 0) {
    htmlContent += `
          <div class="contenedor-tabla">
              <h3>Detalles</h3>
              <table class="tabla-casos">
                  <thead>
                      <tr>
                          <th>Tipo</th>
                          <th>Fecha Creación</th>
                          <th>Fecha Última Gestión</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${data.casos
                        .map(
                          (caso) => `
                          <tr>
                              <td>${caso.tipo || "N/A"}</td>
                              <td>${
                                caso.fecha_creacion
                                  ? new Date(
                                      caso.fecha_creacion
                                    ).toLocaleDateString()
                                  : "N/A"
                              }</td>
                              <td>${
                                caso.fecha_actualizacion
                                  ? new Date(
                                      caso.fecha_actualizacion
                                    ).toLocaleDateString()
                                  : "N/A"
                              }</td>
                          </tr>
                      `
                        )
                        .join("")}
                  </tbody>
              </table>
          </div>`;
  } else {
    htmlContent +=
      '<p class="sin-casos">No se encontraron detalles adicionales</p>';
  }

  detalleDiv.innerHTML = htmlContent;
}

function renderizarObservaciones(observaciones) {
  const contenedor = document.getElementById("observaciones-lista");
  if (!observaciones || observaciones.length === 0) {
    contenedor.innerHTML =
      '<p class="sin-casos">No hay observaciones registradas</p>';
    return;
  }

  contenedor.innerHTML = observaciones
    .map(
      (obs) => `
          <div class="observacion-item">
              <div class="observacion-usuario">${obs.usuario || "Sistema"}</div>
              <div class="observacion-texto">${obs.texto}</div>
              <div class="observacion-fecha">${new Date(
                obs.fecha
              ).toLocaleString()}</div>
          </div>
      `
    )
    .join("");
}

function mostrarError(mensaje) {
  document.getElementById(
    "detalle-contacto"
  ).innerHTML = `<p class="error">${mensaje}</p>`;
}

function mostrarAlerta(mensaje, tipo = "error") {
  document.querySelectorAll(".alerta").forEach((alerta) => alerta.remove());
  const alerta = document.createElement("div");
  alerta.className = `alerta ${tipo}`;
  alerta.textContent = mensaje;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 5000);
}

async function cambiarEstado(casoId) {
  const selector = document.getElementById("selector-estado");
  const nuevoEstado = selector.value;
  const btnCambiarEstado = document.getElementById("btn-cambiar-estado");

  try {
    btnCambiarEstado.disabled = true;
    btnCambiarEstado.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Actualizando...';

    const response = await fetch(`/api/procesos/${casoId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(
        `Respuesta inesperada del servidor: ${text.substring(0, 100)}`
      );
    }

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al actualizar el estado");

    actualizarEstadoEnUI(nuevoEstado);
    configurarSelectorEstado(nuevoEstado);
    mostrarAlerta("Estado actualizado correctamente", "success");
    cargarObservaciones(casoId);
  } catch (error) {
    console.error("Error:", error);
    mostrarAlerta(error.message, "error");
  } finally {
    btnCambiarEstado.disabled = false;
    btnCambiarEstado.textContent = "Actualizar Estado";
  }
}

function actualizarEstadoEnUI(nuevoEstado) {
  const estadoActualElement = document.getElementById("estado-actual");
  if (!estadoActualElement) return;

  let badgeClass, color;
  switch (nuevoEstado.toLowerCase()) {
    case "pendiente":
      badgeClass = "badge-pendiente";
      color = "#ffc107";
      break;
    case "en trámite":
      badgeClass = "badge-en-tramite";
      color = "#17a2b8";
      break;
    case "tramitado":
      badgeClass = "badge-tramitado";
      color = "#28a745";
      break;
    default:
      badgeClass = "badge-pendiente";
      color = "#6c757d";
  }

  estadoActualElement.innerHTML = `
      <p><strong>Estado actual:</strong> <span class="badge-estado ${badgeClass}">${nuevoEstado}</span></p>
  `;

  const selector = document.getElementById("selector-estado");
  if (selector) {
    selector.style.backgroundColor = color;
    selector.style.color = "white";
  }
}
