document.addEventListener("DOMContentLoaded", function () {
  fetch(`/api/graficos`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // ✅ Esto es el arreglo

      const graficoContainer = document.getElementById("grafico_container");

      if (data.error) {
        graficoContainer.innerHTML = `<p class="error">${data.error}</p>`;
      } else {
        data.forEach((cuenta) => {
            if (cuenta.estado != null) {
                const estado = cuenta.estado;
                const grafico = document.createElement("div");
                grafico.innerHTML = `
                    <h3>${cuenta.Tipo_caso}</h3>
                    <p>Estado: ${estado}</p>
                    <div class="grafico-barra" style="width: ${
                      estado * 10
                    }%; background-color:rgb(46, 26, 159); height: 20px; margin-bottom: 10px;"></div>
                  `;
                graficoContainer.appendChild(grafico);
            }
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("grafico_container").innerHTML =
        '<p class="error">Error al cargar los procesos</p>';
    });
});
