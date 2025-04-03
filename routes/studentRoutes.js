const express = require('express');
const router = express.Router();
const { registerStudent, publicRegisterStudent } = require('../controllers/studentController');
const { validateRequest } = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas para registro privado y público
router.post('/register', authMiddleware(['admin', 'registrar']), validateRequest, registerStudent);
router.post('/public-register', validateRequest, publicRegisterStudent);

module.exports = router;
