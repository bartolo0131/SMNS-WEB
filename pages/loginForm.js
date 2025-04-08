document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.status === 200) {
        // Login exitoso -> redirigir al perfil
        window.location.href = 'perfil.html'; // cambia esto según tu archivo real
      } else if (response.status === 401) {
        document.getElementById('message').textContent = 'Credenciales incorrectas.';
      } else {
        document.getElementById('message').textContent = 'Error en el servidor.';
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('message').textContent = 'No se pudo conectar al servidor.';
    }
  });
  