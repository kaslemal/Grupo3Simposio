const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /students/register
router.post('/register', async (req, res) => {
    const {
        carnet, first_name, middle_name, last_name, second_last_name,
        email, phone, payment_type, document_number
    } = req.body;

    // Validar campos obligatorios
    if (!carnet || !first_name || !last_name || !email || !phone || !payment_type || !document_number) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verificar que no exista el carnet
        const check = await client.query(
            'SELECT id FROM students WHERE carnet = $1',
            [carnet]
        );
        if (check.rows.length > 0) {
            throw new Error('El carnet ya está registrado');
        }

        // Insertar estudiante
        const insertStudent = await client.query(
            `INSERT INTO students (carnet, first_name, middle_name, last_name, second_last_name, email, phone)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [carnet, first_name, middle_name, last_name, second_last_name, email, phone]
        );
        const studentId = insertStudent.rows[0].id;

        // Insertar pago (sin confirmed_by aún)
        await client.query(
            `INSERT INTO payments (student_id, payment_type, document_number)
             VALUES ($1, $2, $3)`,
            [studentId, payment_type, document_number]
        );

        await client.query('COMMIT');

        res.status(201).json({ message: 'Estudiante y pago registrados correctamente' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
