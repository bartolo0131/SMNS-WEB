const conexion = require("../config/db");

exports.login = async (req, res) => {
  try {
    // Verifica si el cuerpo de la solicitud existe
    if (!req.body) {
      return res.status(400).render("login", {
        alert: true,
        alertTitle: "Error",
        alertMessage: "No se recibieron datos",
        alertIcon: "error",
        showconfirmButton: true,
        ruta: "login",
      });
    }

    const { login, password } = req.body;

    // Valida que los campos no estén vacíos
    if (!login || !password) {
      return res.render("login", {
        alert: true,
        alertTitle: "Campos vacíos",
        alertMessage: "Por favor, completa todos los campos",
        alertIcon: "warning",
        showconfirmButton: true,
        ruta: "login",
      });
    }

    // Resto de tu lógica de autenticación...
    // (consultar la base de datos, verificar credenciales, etc.)
  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).render("login", {
      alert: true,
      alertTitle: "Error interno",
      alertMessage: "Ocurrió un problema al iniciar sesión",
      alertIcon: "error",
      showconfirmButton: true,
      ruta: "login",
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.send("Error al cerrar sesión");
    }
    res.redirect("/contacto");
  });
};
