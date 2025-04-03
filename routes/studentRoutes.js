const express = require('express');
const router = express.Router();
const { registerStudent } = require('../controllers/studentController');
const { validateRequest } = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para registro privado
router.post('/register', authMiddleware(['admin', 'registrar']), validateRequest, registerStudent);
// Ruta para registro público
router.post('/public-register', validateRequest, publicRegisterStudent);

module.exports = router;
