const crypto = require('crypto');
const { setDbUserContext } = require('../config/db');

// almacenamiento de sesiones simple (para demo)
const sessions = new Map();

// =====================
// LOGIN (VERSIÓN DEMO)
// =====================
const login = async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: 'username y password son obligatorios' });
    }

    // LOGIN SIMPLE PARA DEMO
    if (username === 'admin' && password === 'admin123') {
        const token = 'demo-token';
        sessions.set(token, { id_usuario: 1, roles: ['Administrador'] });

        return res.json({
            token,
            user: { username: 'admin', roles: ['Administrador'] }
        });
    }

    return res.status(401).json({ error: 'Credenciales inválidas' });
};

// =====================
// MIDDLEWARE AUTH
// =====================
const requireAuth = async (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token || !sessions.has(token)) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    req.auth = sessions.get(token);

    // opcional (para triggers, no rompe si falla)
    try {
        await setDbUserContext(req.auth.id_usuario);
    } catch (e) {
        console.warn('No se pudo setear SESSION_CONTEXT:', e.message);
    }

    next();
};

// =====================
// MIDDLEWARE ROLES
// =====================
const requireRole = (roleName) => (req, res, next) => {
    const roles = req.auth?.roles || [];

    if (!roles.includes(roleName)) {
        return res.status(403).json({ error: 'Acceso denegado por rol' });
    }

    next();
};

module.exports = { login, requireAuth, requireRole };