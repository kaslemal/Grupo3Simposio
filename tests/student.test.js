const request = require('supertest');
const app = require('../app'); // Ruta al archivo principal donde se configura Express
const db = require('../config/database'); // Conexión a la base de datos

describe('POST /students/register', () => {
    let token; // Variable para almacenar el token JWT

    beforeAll(async () => {
        // Aquí debes iniciar sesión con un usuario que tenga rol 'admin' o 'registrar' 
        // para obtener el token JWT para las pruebas privadas.
        const response = await request(app)
            .post('/auth/login') // Endpoint para iniciar sesión (implementado por ti)
            .send({ username: 'admin', password: 'adminpassword' });

        token = response.body.token; // Obtener el token
    });

    afterAll(async () => {
        // Limpiar la base de datos después de las pruebas (si es necesario)
        await db.query('DELETE FROM students WHERE carnet = $1', ['12345']); // Asegúrate de limpiar tus datos
    });

    it('should register a student successfully (admin)', async () => {
        const studentData = {
            carnet: '12345',
            nombres: 'Juan',
            apellidos: 'Pérez',
            correo: 'juan.perez@example.com',
            telefono: '123456789',
            tipo_pago: 'transfer',
            documento_numero: '9876543210',
            comentario_pago: 'Pago recibido por Juan'
        };

        const response = await request(app)
            .post('/students/register')
            .set('Authorization', `Bearer ${token}`) // Autenticación con JWT
            .send(studentData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Estudiante registrado exitosamente');
    });

    it('should return 400 if carnet already exists', async () => {
        // Registrar un estudiante primero
        const studentData = {
            carnet: '12345',
            nombres: 'Pedro',
            apellidos: 'Gomez',
            correo: 'pedro.gomez@example.com',
            telefono: '987654321',
            tipo_pago: 'deposit',
            documento_numero: '123456789',
            comentario_pago: 'Pago recibido por Pedro'
        };

        await request(app)
            .post('/students/register')
            .set('Authorization', `Bearer ${token}`)
            .send(studentData);

        // Intentar registrar el mismo carnet de nuevo
        const response = await request(app)
            .post('/students/register')
            .set('Authorization', `Bearer ${token}`)
            .send(studentData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Carnet ya registrado');
    });

    it('should return 401 if no token is provided', async () => {
        const studentData = {
            carnet: '67890',
            nombres: 'Luis',
            apellidos: 'Martínez',
            correo: 'luis.martinez@example.com',
            telefono: '1122334455',
            tipo_pago: 'transfer',
            documento_numero: '2233445566'
        };

        const response = await request(app)
            .post('/students/register')
            .send(studentData);

        expect(response.status).toBe(401); // No autorizado
        expect(response.body.message).toBe('No autorizado');
    });
});
