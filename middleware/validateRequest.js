const { body } = require('express-validator');

const validateRequest = [
    body('carnet').notEmpty().withMessage('Carnet es requerido').isLength({ min: 6 }).withMessage('Carnet debe tener mínimo 6 caracteres'),
    body('nombres').notEmpty().withMessage('Nombres son requeridos'),
    body('apellidos').notEmpty().withMessage('Apellidos son requeridos'),
    body('correo').isEmail().withMessage('Correo no válido'),
    body('telefono').notEmpty().withMessage('Teléfono es requerido'),
    body('tipo_pago').isIn(['cash', 'transfer', 'deposit']).withMessage('Tipo de pago no válido'),
    body('documento_numero').notEmpty().withMessage('Número de documento es requerido')
];

module.exports = { validateRequest };
