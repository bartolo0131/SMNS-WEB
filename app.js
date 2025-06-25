const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();


// Rutas
const webRoutes = require("./routes/webRoutes");
const apiRoutes = require("./routes/apiRoutes");

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



// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
