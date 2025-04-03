const { validationResult } = require('express-validator');
const db = require('../config/database');

// Función para manejar el registro privado
const registerStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validaciones fallidas', error: errors.array() });
    }

    const { carnet, nombres, apellidos, correo, telefono, tipo_pago, documento_numero, comentario_pago } = req.body;

    // Inicia la conexión con la base de datos
    const client = await db.connect();

    try {
        // Validar que el carnet sea único
        const result = await client.query('SELECT * FROM students WHERE carnet = $1', [carnet]);
        if (result.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Carnet ya registrado' });
        }

        // Iniciar transacción
        await client.query('BEGIN');

        // Insertar el nuevo estudiante en la tabla students
        const studentResult = await client.query(`
      INSERT INTO students (carnet, nombres, apellidos, correo, telefono, tipo_pago, documento_numero, verification_status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, [
            carnet, nombres, apellidos, correo, telefono, tipo_pago, documento_numero, 'Pendiente'
        ]);
        const studentId = studentResult.rows[0].id;

        // Registrar la verificación de pago (sin comentarios, ya que el registro es inicial)
        await client.query(`
      INSERT INTO payment_verifications (student_id, previous_status, new_status, comments) 
      VALUES ($1, $2, $3, $4)`, [
            studentId, 'Pendiente', 'Pendiente', comentario_pago || null
        ]);

        // Hacer commit de la transacción
        await client.query('COMMIT');
        return res.status(201).json({ success: true, message: 'Estudiante registrado exitosamente' });
    } catch (error) {
        // En caso de error, hacer rollback
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    } finally {
        client.release(); // Liberar la conexión de la base de datos
    }
};

// Función para manejar el registro público
const publicRegisterStudent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validaciones fallidas', error: errors.array() });
    }

    const { carnet, nombres, correo, telefono, tipo_pago, documento_numero } = req.body;

    // Inicia la conexión con la base de datos
    const client = await db.connect();

    try {
        // Validar que el carnet sea único
        const result = await client.query('SELECT * FROM students WHERE carnet = $1', [carnet]);
        if (result.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Carnet ya registrado' });
        }

        // Iniciar transacción
        await client.query('BEGIN');

        // Insertar el nuevo estudiante en la tabla students (sin verificación de pago)
        const studentResult = await client.query(`
        INSERT INTO students (carnet, nombres, correo, telefono, tipo_pago, documento_numero, verification_status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`, [
            carnet, nombres, correo, telefono, tipo_pago, documento_numero, 'Pendiente'
        ]);
        const studentId = studentResult.rows[0].id;

        // Registrar la verificación de pago (sin comentarios, ya que es solo un registro inicial)
        await client.query(`
        INSERT INTO payment_verifications (student_id, previous_status, new_status) 
        VALUES ($1, $2, $3)`, [
            studentId, 'Pendiente', 'Pendiente'
        ]);

        // Hacer commit de la transacción
        await client.query('COMMIT');
        return res.status(201).json({ success: true, message: 'Estudiante registrado exitosamente' });
    } catch (error) {
        // En caso de error, hacer rollback
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    } finally {
        client.release(); // Liberar la conexión de la base de datos
    }
};

module.exports = { publicRegisterStudent };
module.exports = { registerStudent };
