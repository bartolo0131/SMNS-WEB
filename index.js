// =============================================
// Importación de módulos y configuración inicial
// =============================================
const express = require("express");
const mysql = require("mysql");
const path = require("path");
const session = require("express-session");
const bcryptjs = require("bcryptjs");
const bodyParser = require("body-parser");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

// Inicialización de la aplicación Express
const app = express();
const router = express.Router();

// =============================================
// Configuración de middleware
// =============================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración de sesiones
app.use(
  session({
    secret: "secreto_seguro",
    resave: false,
    saveUninitialized: false,
  })
);

// Configuración del motor de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware para debug de renderizado
app.use((req, res, next) => {
  const originalRender = res.render;
  res.render = function (view, options, callback) {
    console.log(`Renderizando ${view} con datos:`, options);
    originalRender.call(this, view, options, callback);
  };
  next();
});

// =============================================
// Configuración de la base de datos
// =============================================
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smns",
});

// Conexión a la base de datos
conexion.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
    process.exit(1);
  }
  console.log("Conectado a la base de datos MySQL");
});

// =============================================
// Configuración de Multer para subida de archivos
// =============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Asegúrate de que esta carpeta exista
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// =============================================
// Rutas de vistas
// =============================================
const renderRoutes = [
  { path: "/contacto", view: "contacto" },
  { path: "/login", view: "login" },
  { path: "/perfil", view: "perfil" },
  { path: "/registro", view: "registro" },
  { path: "/about", view: "about" },
  { path: "/services", view: "services" },
  { path: "/vision", view: "vision" },
  { path: "/index", view: "index" },
  { path: "/contactosporgestionar", view: "contactosporgestionar" },
  { path: "/cuentas", view: "cuentas" },
  { path: "/detallecontacto", view: "detallecontacto" },
  { path: "/detalle-caso", view: "detalle-caso" },
  { path: "/crear_caso", view: "crear_caso" },
  { path: "/graficas", view: "graficas" },
  { path: "/documentos", view: "documentos" },
  { path: "/costos", view: "costos" },
];

renderRoutes.forEach((route) => {
  app.get(route.path, (req, res) => res.render(route.view));
});

// =============================================
// Rutas de autenticación
// =============================================
app.post("/login", async (req, res) => {
  const { login, password } = req.body;

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
    const results = await new Promise((resolve, reject) => {
      conexion.query(
        "SELECT * FROM usuarios WHERE login = ?",
        [login],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });

    if (results.length === 0 || password !== results[0].Contrasena) {
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

    // Guardar datos en sesión
    req.session.loggedin = true;
    req.session.name = results[0].login;
    req.session.id_rol = results[0].id_rol;

    // Redirigir según rol
    switch (results[0].id_rol) {
      case 5: // administrador
        return res.redirect("/perfil");
      case 2:
        return res.redirect("/registro");
      default:
        return res.redirect("/contacto");
    }
  } catch (error) {
    console.error("Error en la consulta:", error);
    return res.status(500).send("Error interno del servidor");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.send("Error al cerrar sesión");
    }
    res.redirect("/contacto");
  });
});

// =============================================
// Rutas de API
// =============================================

// Contactos
app.post("/contactar", (req, res) => {
  const {
    nombre,
    apellido,
    correo,
    telefono,
    paisorigen,
    tipocaso,
    comentario,
  } = req.body;
  const ingresar =
    "INSERT INTO contacts (nombre, apellido, email, telefono, paisorigen, tipocaso, comentario) VALUES (?, ?, ?, ?, ?, ?, ?)";

  conexion.query(
    ingresar,
    [nombre, apellido, correo, telefono, paisorigen, tipocaso, comentario],
    (error) => {
      if (error) {
        console.error("Error al insertar datos:", error);
        return res.status(500).send("Error en el servidor");
      }
      res.render("contacto", {
        mensaje:
          "We're ready to contact you as soon as possible. One of our attorneys will contact you to guide you through your process.",
        tipoMensaje: "exito",
      });
    }
  );
});

// Registro de usuarios
app.post("/validar", (req, res) => {
  const {
    nombre,
    apellido,
    genero,
    identificacion,
    Telefono,
    documento,
    email,
    fechanacimiento,
  } = req.body;

  const buscar = "SELECT * FROM persona WHERE documento = ?";
  conexion.query(buscar, [documento], (error, row) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error en el servidor");
    }

    if (row.length > 0) {
      return res.render("registro", {
        mensaje: "The user is already registered",
        tipoMensaje: "error",
      });
    }

    const registrar =
      "INSERT INTO persona (nombre, apellido, genero, tip_identificacion, Telefono, fechanacimiento, documento, correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    conexion.query(
      registrar,
      [
        nombre,
        apellido,
        genero,
        identificacion,
        Telefono,
        fechanacimiento,
        documento,
        email,
      ],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Error en el servidor");
        }
        res.render("registro", {
          mensaje: "User successfully registered",
          tipoMensaje: "exito",
        });
      }
    );
  });
});

// API de contactos
app.get("/api/contactos", (req, res) => {
  const sql = "SELECT * FROM contacts ORDER BY id DESC";
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener los contactos:", err);
      return res.status(500).send("Error en el servidor");
    }
    res.json(results);
  });
});

// Actualización de observaciones
app.post("/guardar-observacion", (req, res) => {
  const { id, observacion } = req.body;
  const sql = "UPDATE contacts SET observaciones = ? WHERE id = ?";

  conexion.query(sql, [observacion, id], (err, result) => {
    if (err) {
      console.error("Error al guardar observación:", err);
      return res.status(500).send("Error al guardar");
    }
    res.send("OK");
  });
});

// Actualización de estado
app.post("/actualizar-estado", (req, res) => {
  const { id, estado } = req.body;
  const sql = "UPDATE contacts SET estado = ? WHERE id = ?";

  conexion.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar el estado:", err);
      return res.status(500).send("Error en el servidor");
    }
    res.send("Estado actualizado correctamente");
  });
});

// API de personas
app.get("/api/personas", (req, res) => {
  const sql = "SELECT * FROM persona ORDER BY id DESC";
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener los contactos:", err);
      return res.status(500).send("Error en el servidor");
    }
    res.json(results);
  });
});

// Detalle de persona por ID
app.get("/api/personas/:id", (req, res) => {
  const id = req.params.id;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID no válido" });
  }

  const sql = `
    SELECT p.*, u.*, c.casonumero, c.tipo_caso, c.fecha_creacion, c.fecha_actualizacion, c.estado, d.rol AS nombre_rol
    FROM persona p 
    LEFT JOIN usuarios u ON p.id = u.idusuarios 
    LEFT JOIN PROCESOS c ON p.id = c.idusuario
    LEFT JOIN rol d ON d.idrol = u.id_rol
    WHERE p.id = ?`;

  conexion.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener el contacto:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }

    const response = {
      id: results[0].id,
      nombre: results[0].nombre,
      apellido: results[0].apellido,
      login: results[0].login,
      id_rol: results[0].id_rol,
      nombre_rol: results[0].nombre_rol || "No especificado",
      correo: results[0].correo,
      telefono: results[0].telefono,
      pais: results[0].pais,
      casos: results
        .filter((row) => row.casonumero !== null)
        .map((row) => ({
          numero: row.casonumero,
          tipo: row.tipo_caso || "No especificado",
          fecha_creacion: row.fecha_creacion
            ? row.fecha_creacion
            : "No especificada",
          fecha_actualizacion: row.fecha_actualizacion
            ? row.fecha_actualizacion
            : "No actualizado",
          estado: row.estado || "No especificado",
        })),
    };

    res.json(response);
  });
});

// API de gráficos
app.get("/api/graficos", (req, res) => {
  const query = `SELECT * FROM procesos`;
  conexion.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los datos:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No hay datos para mostrar" });
    }

    res.json(results);
  });
});

// Detalle de caso por número
app.get("/api/procesos/:casonumero", (req, res) => {
  const casonumero = req.params.casonumero;

  if (isNaN(casonumero)) {
    return res.status(400).json({ error: "Número de caso no válido" });
  }

  const sql = `
    SELECT p.casonumero, p.tipo_caso, p.fecha_creacion, p.observaciones,
          p.fecha_actualizacion, p.estado,
          per.nombre, per.apellido
    FROM procesos p 
    LEFT JOIN persona per ON p.idusuario = per.id
    WHERE p.casonumero = ?`;

  conexion.query(sql, [casonumero], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Caso no encontrado" });
    }

    const response = {
      casonumero: results[0].casonumero,
      nombre: results[0].nombre || "No especificado",
      apellido: results[0].apellido || "No especificado",
      casos: results.map((row) => ({
        casonumero: row.casonumero,
        tipo: row.tipo_caso || "No especificado",
        fecha_creacion: row.fecha_creacion || "No especificada",
        fecha_actualizacion: row.fecha_actualizacion || "No actualizado",
        estado: row.estado || "No especificado",
        observaciones: row.observaciones || "",
      })),
    };

    res.json(response);
  });
});

// Observaciones de caso
app.get("/api/procesos/:casonumero/observaciones", (req, res) => {
  const casonumero = req.params.casonumero;

  if (isNaN(casonumero)) {
    return res.status(400).json({ error: "Número de caso no válido" });
  }

  const sql = `
    SELECT o.id, o.observacion AS texto, o.fecha_creacion AS fecha 
    FROM observaciones o
    LEFT JOIN usuarios u ON o.id_usuario = u.idusuarios
    WHERE o.casonumero = ?
    ORDER BY o.fecha_creacion DESC`;

  conexion.query(sql, [casonumero], (err, results) => {
    if (err) {
      console.error("Error al obtener observaciones:", err);
      return res.status(500).json({ error: "Error al obtener observaciones" });
    }

    const observaciones = results.map((row) => ({
      id: row.id,
      texto: row.texto,
      fecha: row.fecha,
      usuario: `${row.nombre || "Anónimo"} ${row.apellido || ""}`.trim(),
    }));

    res.json(observaciones);
  });
});

// Crear observación
app.post("/api/procesos/:casonumero/observaciones", async (req, res) => {
  const { casonumero } = req.params;
  const { observacion, id_usuario } = req.body;

  if (isNaN(casonumero)) {
    return res.status(400).json({
      success: false,
      error: "Número de caso no válido",
    });
  }

  if (!observacion || observacion.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "La observación no puede estar vacía",
    });
  }

  try {
    // Verificar que el caso existe
    const caso = await new Promise((resolve, reject) => {
      conexion.query(
        "SELECT casonumero FROM procesos WHERE casonumero = ?",
        [casonumero],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });

    if (caso.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Caso no encontrado",
      });
    }

    // Insertar la observación
    const result = await new Promise((resolve, reject) => {
      conexion.query(
        `INSERT INTO observaciones 
        (observacion, id_usuario, casonumero, fecha_creacion) 
        VALUES (?, ?, ?, NOW())`,
        [observacion.trim(), id_usuario || null, casonumero],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });

    res.status(201).json({
      success: true,
      message: "Observación creada",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al insertar observación:", error);
    res.status(500).json({
      success: false,
      error: "Error al guardar la observación",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Actualizar estado de caso
app.put("/api/procesos/:casonumero/estado", async (req, res) => {
  const { casonumero } = req.params;
  const { estado } = req.body;
  const usuarioId = req.user?.id || "sistema";

  // Validar el estado
  const estadosPermitidos = ["Pendiente", "En trámite", "Tramitado"];
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      success: false,
      error:
        "Estado no válido. Los permitidos son: Pendiente, En trámite, Tramitado",
    });
  }

  try {
    // 1. Actualizar el proceso
    const updateResult = await new Promise((resolve, reject) => {
      const sqlUpdate =
        "UPDATE procesos SET estado = ?, fecha_actualizacion = NOW() WHERE casonumero = ?";
      conexion.query(sqlUpdate, [estado, casonumero], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Caso no encontrado",
      });
    }

    // 2. Registrar observación automática (opcional)
    const observacion = `Estado actualizado a: ${estado}`;
    try {
      await new Promise((resolve, reject) => {
        const sqlObs = `INSERT INTO observaciones 
                        (observacion, id_usuario, casonumero, fecha_creacion) 
                        VALUES (?, ?, ?, NOW())`;
        conexion.query(
          sqlObs,
          [observacion, usuarioId, casonumero],
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          }
        );
      });
    } catch (obsError) {
      console.error("Error al registrar observación:", obsError);
    }

    res.json({
      success: true,
      message: "Estado actualizado correctamente",
      nuevoEstado: estado,
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({
      success: false,
      error: "Error en el servidor al actualizar el estado",
    });
  }
});

// =============================================
// Rutas de procesos
// =============================================
app.get("/procesos", (req, res) => {
  res.render("procesos", {
    mensaje: null,
    tipoMensaje: null,
    datosFormulario: null,
  });
});

app.post("/procesos", (req, res) => {
  const { tipo_caso, area_practica, estado, observaciones, fecha_creacion } =
    req.body;

  // Validación
  const errores = [];
  if (!tipo_caso) errores.push("El tipo de caso es requerido");
  if (!area_practica) errores.push("El área práctica es requerida");
  if (!estado) errores.push("El estado es requerido");
  if (!observaciones) errores.push("Las observaciones son requeridas");
  if (!fecha_creacion) errores.push("La fecha de creación es requerida");

  if (errores.length > 0) {
    return res.render("procesos", {
      mensaje: errores.join("<br>"),
      tipoMensaje: "error",
      datosFormulario: req.body,
    });
  }

  // Procesar en BD
  const query = "INSERT INTO procesos SET ?";
  const datos = {
    tipo_caso,
    area_practica,
    estado,
    observaciones,
    fecha_creacion,
  };

  conexion.query(query, datos, (error, results) => {
    if (error) {
      console.error("Error en BD:", error);
      return res.render("procesos", {
        mensaje: "Error al guardar en la base de datos",
        tipoMensaje: "error",
        datosFormulario: req.body,
      });
    }

    res.render("procesos", {
      mensaje: "Caso registrado exitosamente",
      tipoMensaje: "exito",
      datosFormulario: null,
    });
  });
});

// =============================================
// Rutas de documentos
// =============================================
app.post(
  "/api/procesos/:numerocaso/documentos",
  upload.single("adjuntos"),
  (req, res) => {
    const nombre = req.body.nombre;
    const numerocaso = req.params.numerocaso;
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).send("No se subió ningún archivo.");
    }

    const nombreArchivo = archivo.filename;
    const rutaArchivo = archivo.path;

    const query = `
    INSERT INTO documentos (nombre, archivo, ruta, id_proceso)
    VALUES (?, ?, ?, ?)
  `;

    conexion.query(
      query,
      [nombre, nombreArchivo, rutaArchivo, numerocaso],
      (err, result) => {
        if (err) {
          console.error("Error al insertar en la base de datos:", err);
          return res.status(500).send("Error al guardar en la base de datos.");
        }

        console.log("📄 Documento subido y guardado:", {
          nombre,
          nombreArchivo,
          rutaArchivo,
          numerocaso,
        });

        res.send("✅ Documento subido y guardado correctamente.");
      }
    );
  }
);

// =============================================
// Inicio del servidor
// =============================================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = router;
