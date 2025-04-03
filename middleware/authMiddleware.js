const jwt = require('jsonwebtoken');

const authMiddleware = (roles) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (roles && !roles.includes(decoded.role)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ success: false, message: 'Token inválido' });
        }
    };
};

module.exports = authMiddleware;
