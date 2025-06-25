const conexion = require("../config/db");

exports.submitContact = function (req, res) {
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
    function (error) {
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
};

exports.registerUser = function (req, res) {
  const datos = req.body;
  const {
    nombre,
    apellido,
    genero,
    identificacion,
    Telefono,
    documento,
    email,
    fechanacimiento,
  } = datos;

  const buscar = "SELECT * FROM persona WHERE documento = ?";
  conexion.query(buscar, [documento], function (error, row) {
    if (error) throw error;

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
      function (error) {
        if (error) throw error;
        res.render("registro", {
          mensaje: "User successfully registered",
          tipoMensaje: "exito",
        });
      }
    );
  });
};
