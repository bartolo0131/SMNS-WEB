<script>
  document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 200) {
        const data = await response.json();
        const rol = data.rol;

        // Redirige al perfil según el rol
        if (rol === 'admin') {
          window.location.href = '/view/perfil_admin.html';
        } else if (rol === 'abogado') {
          window.location.href = '/view/perfil_abogado.html';
        } else if (rol === 'cliente') {
          window.location.href = '/view/perfil_cliente.html';
        } else {
          window.location.href = '/view/perfil.html'; // Default
        }

      } else if (response.status === 401) {
        document.getElementById('message').textContent =
          'Credenciales incorrectas. Verifica tu correo y contraseña.';
      } else {
        document.getElementById('message').textContent = 'Error en el servidor.';
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('message').textContent = 'No se pudo conectar al servidor.';
    }
  });
</script>
