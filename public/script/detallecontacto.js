document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const idContacto = urlParams.get("id");

  if (idContacto) {
    fetch(`/api/personas/${idContacto}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          document.getElementById(
            "detalle-contacto"
          ).innerHTML = `<p class="error">${data.error}</p>`;
        } else {
          // Crear tabla de casos
          let casosHTML = '<p class="sin-casos">No tiene casos registrados</p>';
          if (data.casos && data.casos.length > 0) {
            casosHTML = `
                            <div class="contenedor-tabla">
                                <h3>Casos asociados</h3>
                                <div class="tabla-container">
                                    <table class="tabla-casos">
                                        <thead>
                                            <tr>
                                                <th>Caso Número</th>
                                                <th>Tipo</th>
                                                <th>Creación</th>
                                                <th>Actualización</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${data.casos
                                              .map(
                                                (caso) => `
                                                <tr>
                                                    <td>
                                                        <a href="/detalle-caso?id=${caso.numero}&id_usuario=${idContacto}" class="enlace-caso">
                                                            ${caso.numero}
                                                        </a>
                                                    </td>
                                                    <td>${caso.tipo}</td>
                                                    <td>${caso.fecha_creacion}</td>
                                                    <td>${caso.fecha_actualizacion}</td>
                                                    <td>${caso.estado}</td>
                                                </tr>
                                            `
                                              )
                                              .join("")}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
          }

          document.getElementById("detalle-contacto").innerHTML = `
                        <div class="info-contacto">
                            <p><strong>Esta es la cuenta de: </strong>${
                              data.nombre_rol
                            } <strong>, </strong>${data.nombre} ${
            data.apellido
          }</p>
                            <p><strong>Correo:</strong> ${
                              data.correo || "No especificado"
                            }</p>
                            <p><strong>Teléfono:</strong> ${
                              data.telefono || "No especificado"
                            }</p>
                            <p><strong>País de origen: </strong> ${
                              data.pais || "No especificado"
                            }</p>
                        </div>
                        ${casosHTML}
                    `;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("detalle-contacto").innerHTML =
          '<p class="error">Error al cargar los datos del contacto</p>';
      });
  }
});
