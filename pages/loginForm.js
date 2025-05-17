document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    setTimeout(async () => {

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.status === 200) {
        // Login exitoso me lleva redirigir al perfil
        window.location.href = 'perfil.html'; 
      } else if (response.status === 401) {
        document.getElementById('message').textContent = 
        'The provided credentials are incorrect. Please check your Email and password and try again.';
          document.getElementById('email').value = '';
          document.getElementById('password').value = '';
      } else {
        document.getElementById('message').textContent = 'Error en el servidor.';
          document.getElementById('email').value = '';
          document.getElementById('password').value = '';
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('message').textContent = 'No se pudo conectar al servidor.';
    }
  }, 3000);
 });




  