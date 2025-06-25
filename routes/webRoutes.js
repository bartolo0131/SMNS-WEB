const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const contactController = require("../controllers/contactController");
const caseController = require("../controllers/caseController");

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
router.get("/detalle-caso", (req, res) => res.render("detalle-caso"));
router.get("/crear_caso", (req, res) => res.render("crear_caso"));
router.get("/graficas", (req, res) => res.render("graficas"));
router.get("/documentos", (req, res) => res.render("documentos"));
router.get("/costos", (req, res) => res.render("costos"));
router.get("/procesos", caseController.showProcessForm);

// Rutas con lógica
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/contactar", contactController.submitContact);
router.post("/validar", contactController.registerUser);
router.post("/procesos", caseController.createProcess);

module.exports = router;
