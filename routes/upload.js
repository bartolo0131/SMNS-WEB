const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();
const upload = multer({ dest: 'backend/uploads/' });

router.post('/upload', upload.single('archivo'), uploadController.handleUpload);

module.exports = router;

