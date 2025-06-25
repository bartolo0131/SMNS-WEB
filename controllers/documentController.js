const conexion = require("../config/db");
const upload = require("../config/multer");

exports.uploadDocument = (req, res) => {
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
};
