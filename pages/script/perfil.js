document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
  
    if (!user) {
      // Redirige si no hay datos
      window.location.href = 'loginc.html';
      return;
    }
  
    const loginElement = document.getElementById('login');
    if (loginElement) {
      loginElement.textContent = user.login;
    } else {
      console.warn("Elemento con id='login' no encontrado en el DOM.");
    }
  
    // Función global para cerrar sesión
    window.logout = function () {
      localStorage.removeItem('user');
      window.location.href = 'loginc.html';
    };
  });