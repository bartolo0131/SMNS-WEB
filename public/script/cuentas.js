      // Variables 
      let contactos = [];
      let contactosFiltrados = [];
      let paginaActual = 1;
      const registrosPorPagina = 15;

      // Función para cargar los contactos 
      function cargarContactos() {
        fetch('/api/personas')
          .then(res => res.json())
          .then(data => {
            contactos = data;
            contactosFiltrados = [...contactos]; // permite realizar filtrado
            // Mostrar la primera página y la paginación
            mostrarPagina(1);
            mostrarPaginacion();
          })
          .catch(err => console.error('Error al cargar:', err));
      }

      // Función de filtro
      function filtrarTabla() {
        const textoBusqueda = document.getElementById('buscador').value.toLowerCase();
        
        if (textoBusqueda === '') {
          contactosFiltrados = [...contactos];
        } else {
          contactosFiltrados = contactos.filter(contacto => 
            Object.values(contacto).some(valor => 
              String(valor).toLowerCase().includes(textoBusqueda)
            )
          );
        }
        
        mostrarPagina(1);
        mostrarPaginacion();
      }

      // Función para mostrar mostrar la pagina seleccionada

    function mostrarPagina(pagina) {
      paginaActual = pagina;
      const inicio = (pagina - 1) * registrosPorPagina;
      const fin = inicio + registrosPorPagina;
      const visibles = contactosFiltrados.slice(inicio, fin);

      const tabla = document.getElementById('tabla-contactos');
      tabla.innerHTML = '';
      visibles.forEach(contacto => {
        tabla.innerHTML += `
          <tr>
            <td>        <a href="/detallecontacto?id=${contacto.id}" 
           onclick="return validarId(${contacto.id})"
           style="color: #0066cc; text-decoration: underline;">
          ${contacto.id}
            </a></td>
            <td>${contacto.nombre}</td>
            <td>${contacto.apellido}</td>
            <td>${contacto.correo}</td>
            <td>${contacto.telefono}</td>
            <td>${contacto.pais}</td>
          </tr>`;
      });
    }

      // Función para mostrar la paginación
      function mostrarPaginacion() {
        const totalPaginas = Math.ceil(contactosFiltrados.length / registrosPorPagina);
        const contenedor = document.getElementById('paginacion');
        contenedor.innerHTML = '';

        for (let i = 1; i <= totalPaginas; i++) {
          contenedor.innerHTML += `
            <button class="${i === paginaActual ? 'active' : ''}" onclick="mostrarPagina(${i})">
              ${i}
            </button>`;
        }
      }

       function validarId(id) {              
        if (isNaN(id) || id <= 0) {
          alert("ID de contacto no válido");
          return false; // Previene la navegación
        }
        return true;
        }


      // Cargar contactos al iniciar la página
      document.addEventListener('DOMContentLoaded', cargarContactos);