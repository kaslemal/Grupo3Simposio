const express = require('express');
const app = express();

// Aquí van todas tus rutas, middlewares, etc.
app.use(express.json());

// Rutas de ejemplo
app.post('/students/register', (req, res) => {
    res.status(201).json({ success: true, message: 'Estudiante registrado exitosamente' });
});

module.exports = app; // Asegúrate de exportar la app
