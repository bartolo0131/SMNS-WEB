document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const email = emailInput.value;
  const password = passwordInput.value;

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
      document.getElementById('message').textContent = 
        'Las credenciales proporcionadas son incorrectas. Por favor, verifica tu nombre de usuario y contraseña e inténtalo de nuevo.';

      // 🔴 Limpia los campos
      emailInput.value = '';
      passwordInput.value = '';

      // 🔁 Enfoca el campo de correo
      emailInput.focus();
    } else {
      document.getElementById('message').textContent = 'Error en el servidor.';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('message').textContent = 'No se pudo conectar al servidor.';
  }
});
