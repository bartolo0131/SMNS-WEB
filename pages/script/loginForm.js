document.getElementById('loginForm').addEventListener('submit', async (e) => {
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
      const data = await response.json(); // 🔁 Aquí llegan los datos del usuario

      // ✅ Guarda los datos en localStorage
      localStorage.setItem('user', JSON.stringify(data));

      // Redirige al perfil
      window.location.href = 'perfil.html';
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