const conexion = require("../config/db");

exports.showProcessForm = (req, res) => {
  res.render("procesos", {
    mensaje: null,
    tipoMensaje: null,
    datosFormulario: null,
  });
};

exports.createProcess = (req, res) => {
  const { tipo_caso, area_practica, estado, observaciones, fecha_creacion } =
    req.body;

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
};
