const express = require("express");
const router = express.Router();
const conexion = require("../config/db");
const upload = require("../config/multer");

// =============================================
// API de Contactos
// =============================================

router.get("/contactos", (req, res) => {
  const sql = "SELECT * FROM contacts ORDER BY id DESC";
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener los contactos:", err);
      return res.status(500).send("Error en el servidor");
    }
    res.json(results);
  });
});

router.post("/guardar-observacion", (req, res) => {
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

router.post("/actualizar-estado", (req, res) => {
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

// =============================================
// API de Personas/Usuarios
// =============================================

router.get("/personas", (req, res) => {
  const sql = "SELECT * FROM persona ORDER BY id DESC";

  conexion.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener los contactos:", err);
      return res.status(500).send("Error en el servidor");
    }
    res.json(results);
  });
});

router.get("/personas/:id", (req, res) => {
  const id = req.params.id;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID no válido" });
  }

  const sql = `
    SELECT p.*, u.*, c.casonumero, c.tipo_caso, c.fecha_creacion, 
           c.fecha_actualizacion, c.estado, d.rol AS nombre_rol
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
          fecha_creacion: row.fecha_creacion || "No especificada",
          fecha_actualizacion: row.fecha_actualizacion || "No actualizado",
          estado: row.estado || "No especificado",
        })),
    };

    res.json(response);
  });
});

// =============================================
// API de Procesos/Casos
// =============================================

router.get("/graficos", (req, res) => {
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

router.get("/procesos/:casonumero", (req, res) => {
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

router.get("/procesos/:casonumero/observaciones", (req, res) => {
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

router.post("/procesos/:casonumero/observaciones", async (req, res) => {
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
    const [caso] = await new Promise((resolve, reject) => {
      conexion.query(
        "SELECT casonumero FROM procesos WHERE casonumero = ?",
        [casonumero],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });

    if (!caso) {
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
    });
  }
});

router.put("/procesos/:casonumero/estado", async (req, res) => {
  const { casonumero } = req.params;
  const { estado } = req.body;
  const usuarioId = req.user?.id || "sistema";

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
// API de Documentos
// =============================================

router.post(
  "/procesos/:numerocaso/documentos",
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
    VALUES (?, ?, ?, ?)`;

    conexion.query(
      query,
      [nombre, nombreArchivo, rutaArchivo, numerocaso],
      (err, result) => {
        if (err) {
          console.error("Error al insertar documento:", err);
          return res.status(500).send("Error al guardar en la base de datos.");
        }

        console.log("Documento subido y guardado:", {
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




router.get("/datos", async (req, res) => {
  try {
    const query = `
        SELECT 
          tipo_caso,
          estado,
          COUNT(*) as cantidad
        FROM procesos
        GROUP BY tipo_caso, estado
        ORDER BY tipo_caso`;

    const [results] = await new Promise((resolve, reject) => {
      conexion.query(query, (error, results) => {
        if (error) return reject(error);
        resolve([results]);
      });
    });

    if (!results || results.length === 0) {
      return res.status(200).json({
        labels: ["No hay datos"],
        datasets: [
          {
            label: "Sin registros",
            data: [1],
            backgroundColor: "rgba(200, 200, 200, 0.5)",
          },
        ],
      });
    }

    const labels = [];
    const datasetsMap = new Map();

    results.forEach((item) => {
      if (item.tipo_caso && !labels.includes(item.tipo_caso)) {
        labels.push(item.tipo_caso);
      }

      if (item.estado) {
        if (!datasetsMap.has(item.estado)) {
          datasetsMap.set(item.estado, {
            label: item.estado,
            data: new Array(labels.length).fill(0),
            backgroundColor: `rgba(${Math.floor(
              Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 255
            )}, 0.5)`,
          });
        }

        const index = labels.indexOf(item.tipo_caso);
        if (index !== -1) {
          datasetsMap.get(item.estado).data[index] = item.cantidad;
        }
      }
    });

    res.json({
      labels: labels.length ? labels : ["No hay tipos"],
      datasets: datasetsMap.size
        ? Array.from(datasetsMap.values())
        : [
            {
              label: "Sin estados",
              data: labels.map(() => 0),
              backgroundColor: "rgba(200, 200, 200, 0.5)",
            },
          ],
    });
  } catch (error) {
    console.error("Error en /api/datos:", error);
    res.status(500).json({
      success: false,
      error: "Error al procesar datos",
    });
  }
});

module.exports = router;
