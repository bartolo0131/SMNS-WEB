const express = require('express');
const router = express.Router();

// Rutas
router.get('/', (req, res) => {
  res.json({ message: "Ruta de procesos funcionando" });
});

// ¡Asegúrate de exportar el router!
module.exports = router;