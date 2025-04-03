const db = require('../config/database');
const { validationResult } = require('express-validator');
const { generateToken } = require('../config/jwt');

// Función para manejar el registro privado
const registerStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validaciones fallidas', error: errors.array() });
    }

    const { carnet, nombres, apellidos, correo, telefono, tipo_pago, documento_numero, comentario_pago } = req.body;

    try {
        const result = await db.query('SELECT * FROM students WHERE carnet = $1', [carnet]);
        if (result.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Carnet ya registrado' });
        }

        // Iniciar transacción para registrar estudiante y verificación de pago
        await db.query('BEGIN');

        const studentResult = await db.query('INSERT INTO students (carnet, nombres, apellidos, correo, telefono, tipo_pago, documento_numero, verification_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id', [
            carnet, nombres, apellidos, correo, telefono, tipo_pago, documento_numero, 'Pendiente'
        ]);

        const studentId = studentResult.rows[0].id;

        // Registrar verificación de pago
        await db.query('INSERT INTO payment_verifications (student_id, previous_status, new_status, comments) VALUES ($1, $2, $3, $4)', [
            studentId, 'Pendiente', 'Pendiente', comentario_pago
        ]);

        await db.query('COMMIT');
        return res.status(201).json({ success: true, message: 'Estudiante registrado exitosamente' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Función para manejar el registro público
const publicRegisterStudent = async (req, res) => {
    // Lógica similar, pero sin autenticación y con validaciones adicionales
};

module.exports = { registerStudent, publicRegisterStudent };
