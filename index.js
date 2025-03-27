const express = require('express');
const app = express();
const pool = require('./db'); // Conexión a la BD
require('dotenv').config();

app.use(express.json());

// Ruta de prueba
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.send(`Servidor funcionando. Hora actual de la BD: ${result.rows[0].now}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al conectarse a la base de datos');
    }
});

const studentsRouter = require('./routes/students');
app.use('/students', studentsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
