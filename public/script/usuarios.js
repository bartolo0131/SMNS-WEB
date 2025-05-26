    fetch('/api/usuarios')
      .then(response => response.json())
      .then(data => {
        const tabla = document.getElementById('tabla-contactos');
        data.forEach(contacto => {
          tabla.innerHTML += `
            <tr>
              <td>${contacto.id}</td>
              <td>${contacto.nombre}</td>

             
            </tr>`;
        });
      })
      .catch(err => console.error('Error:', err));




