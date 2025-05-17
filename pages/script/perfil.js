
document.getElementById('logout-btn').addEventListener('click', () => {
    // Elimina la información del usuario almacenada
    localStorage.removeItem('user');

    // Redirige al inicio de sesión
    window.location.href = 'loginc.html';
  });    