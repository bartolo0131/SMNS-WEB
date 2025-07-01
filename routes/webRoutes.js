const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const contactController = require("../controllers/contactController");
const caseController = require("../controllers/caseController");
const path = require("path");

const conexion = require("../config/db");

// Rutas de vistas
router.get("/", (req, res) => res.render("index"));
router.get("/contacto", (req, res) => res.render("contacto"));
router.get("/login", (req, res) => res.render("login"));
router.get("/perfil", (req, res) => res.render("perfil"));
router.get("/registro", (req, res) => res.render("registro"));
router.get("/about", (req, res) => res.render("about"));
router.get("/services", (req, res) => res.render("services"));
router.get("/vision", (req, res) => res.render("vision"));
router.get("/contactosporgestionar", (req, res) =>
  res.render("contactosporgestionar")
);
router.get("/cuentas", (req, res) => res.render("cuentas"));
router.get("/detallecontacto", (req, res) => res.render("detallecontacto"));
//router.get("/detalle-caso", (req, res) => res.render("detalle-caso"));
router.get("/crear_caso", (req, res) => res.render("crear_caso"));
router.get("/graficas", (req, res) => res.render("graficas"));
router.get("/documentos", (req, res) => res.render("documentos"));

router.get("/costos", async (req, res) => {
  try {
    const documentos = await new Promise((resolve, reject) => {
      conexion.query(
        "SELECT * FROM documentos",
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    res.render("costos", { documentos });
  } catch (error) {
    console.error("Error al cargar documentos:", error);
    res.render("costos", { documentos: [] });
  }
});

router.get("/detalle-caso", async (req, res) => {
  const idCaso = req.query.id;
  if (!idCaso) return res.status(400).send("ID de caso no proporcionado");

  try {
    const documentos = await new Promise((resolve, reject) => {
      conexion.query(
        "SELECT * FROM documentos WHERE id_proceso = ?",
        [idCaso],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    res.render("detalle-caso", { documentos, idCaso });
  } catch (error) {
    console.error("Error al cargar documentos:", error);
    res.render("detalle-caso", { documentos: [], idCaso });
  }
});




router.get("/descargar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    conexion.query(
      "SELECT nombre, ruta FROM documentos WHERE id = ?",
      [id],
      (error, resultados) => {
        if (error) return res.status(500).send("Error al buscar el documento");
        if (!resultados.length)
          return res.status(404).send("Documento no encontrado");

        const documento = resultados[0];
        const filePath = path.join(__dirname, "..", documento.ruta);

        res.download(filePath, documento.nombre);
      }
    );
  } catch (error) {
    console.error("Error en la descarga:", error);
    res.status(500).send("Error al procesar la descarga");
  }
});


router.get("/procesos", caseController.showProcessForm);

// Rutas con lógica

router.post("/contactar", contactController.submitContact);
router.post("/validar", contactController.registerUser);
router.post("/procesos", caseController.createProcess);

module.exports = router;