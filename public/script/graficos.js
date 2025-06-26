document.addEventListener("DOMContentLoaded", function () {
  const loadingElement = document.getElementById("loading");
  const errorContainer = document.getElementById("errorContainer");
  const chartsContainer = document.getElementById("chartsContainer");

  // Colores consistentes para los estados
  const estadoColors = {
    Abierto: "#36A2EB",
    Cerrado: "#FF6384",
    "En progreso": "#FFCE56",
    Pendiente: "#4BC0C0",
    Resuelto: "#9966FF",
    Rechazado: "#FF9F40",
  };

  // Función para obtener color según el estado
  function getColorForEstado(estado) {
    return (
      estadoColors[estado] ||
      `#${Math.floor(Math.random() * 16777215).toString(16)}`
    );
  }

  fetch("/api/datos")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Datos recibidos:", data);

      // Ocultar loading y mostrar gráficas
      loadingElement.style.display = "none";
      errorContainer.style.display = "none";
      chartsContainer.style.display = "flex";

      // Preparar colores consistentes para gráfica de barras
      if (data.barData.datasets) {
        data.barData.datasets.forEach((dataset) => {
          dataset.backgroundColor = getColorForEstado(dataset.label);
          dataset.borderColor = dataset.backgroundColor;
          dataset.borderWidth = 1;
        });
      }

      // Gráfica de Barras
      new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: data.barData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${context.raw}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Cantidad de Casos",
              },
            },
            x: {
              title: {
                display: true,
                text: "Tipos de Casos",
              },
            },
          },
        },
      });

      // Gráfica de Torta
      new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: data.pieData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
            title: {
              display: false,
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      loadingElement.style.display = "none";
      errorContainer.style.display = "block";
      errorContainer.innerHTML = `
        <h3>Error al cargar los datos</h3>
        <p>${error.message}</p>
        <p>Por favor intente nuevamente más tarde.</p>
      `;
    });
});
