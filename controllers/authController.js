const conexion = require("../config/db");

exports.login = async (req, res) => {
  const login = req.body.login;
  const contrasena = req.body.password;

  if (login && contrasena) {
    conexion.query(
      "SELECT * FROM usuarios WHERE login = ?",
      [login],
      async (error, results) => {
        if (error) {
          console.error("Error en la consulta:", error);
          return res.status(500).send("Error interno del servidor");
        }

        if (results.length === 0 || contrasena !== results[0].Contrasena) {
          return res.render("login", {
            alert: true,
            alertTitle: "Credenciales erradas",
            alertMessage: "USUARIO O CONTRASEÑA INCORRECTOS",
            alertIcon: "error",
            showconfirmButton: false,
            time: false,
            ruta: "login",
          });
        }

        req.session.loggedin = true;
        req.session.name = results[0].login;
        req.session.id_rol = results[0].id_rol;

        switch (results[0].id_rol) {
          case 5:
            res.redirect("/perfil");
            break;
          case 2:
            res.redirect("/registro");
            break;
          default:
            res.redirect("/contacto");
        }
      }
    );
  } else {
    res.render("login", {
      alert: true,
      alertTitle: "Campos vacíos",
      alertMessage: "Por favor, llena todos los campos",
      alertIcon: "warning",
      showconfirmButton: true,
      time: false,
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
