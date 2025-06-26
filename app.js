const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const conexion = require("./config/db");



// Rutas
const webRoutes = require("./routes/webRoutes");
const apiRoutes = require("./routes/apiRoutes");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use("/", webRoutes);
app.use("/api", apiRoutes);

  


// Configuración
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "secreto_seguro",
    resave: false,
    saveUninitialized: false,
  })
);

// Debug de renderizado
app.use((req, res, next) => {
  const originalRender = res.render;
  res.render = function (view, options, callback) {
    console.log(`Renderizando ${view}`);
    originalRender.call(this, view, options, callback);
  };
  next();
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body;

  // Validación de campos vacíos
  if (!login || !password) {
    return res.render("login", {
      alert: true,
      alertTitle: "Campos vacíos",
      alertMessage: "Por favor, llena todos los campos",
      alertIcon: "warning",
      showconfirmButton: true,
      time: false,
      ruta: "login",
    });
  }

  try {
    console.log("Intentando login para usuario:", login);

    const results = await new Promise((resolve, reject) => {
      conexion.query(
        "SELECT * FROM usuarios WHERE login = ?",
        [login],
        (error, results) => {
          if (error) {
            console.error("Error en consulta SQL:", error);
            reject(error);
            return;
          }
          resolve(results);
        }
      );
    });

    if (results.length === 0) {
      console.log("Usuario no encontrado:", login);
      return res.render("login", {
        alert: true,
        alertTitle: "Credenciales incorrectas",
        alertMessage: "Usuario no encontrado",
        alertIcon: "error",
        showconfirmButton: false,
        time: false,
        ruta: "login",
      });
    }

    const user = results[0];
    console.log("Usuario encontrado. Rol:", user.id_rol);

    if (password !== user.Contrasena) {
      console.log("Contraseña incorrecta para usuario:", login);
      return res.render("login", {
        alert: true,
        alertTitle: "Credenciales incorrectas",
        alertMessage: "Contraseña incorrecta",
        alertIcon: "error",
        showconfirmButton: false,
        time: false,
        ruta: "login",
      });
    }

    // Configurar sesión
    req.session.loggedin = true;
    req.session.name = user.login;
    req.session.id_rol = user.id_rol;

    console.log("Login exitoso. Redirigiendo a /graficas");
    return res.redirect("/graficas");
  } catch (error) {
    console.error("Error completo en login:", error.stack);
    return res.status(500).render("login", {
      alert: true,
      alertTitle: "Error interno",
      alertMessage: "Ocurrió un problema al iniciar sesión",
      alertIcon: "error",
      showconfirmButton: true,
      time: false,
      ruta: "login",
    });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al destruir sesión:", err);
      return res.status(500).send("Error al cerrar sesión");
    }
    res.redirect("/contacto");
  });
});
// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
