const crypto = require('crypto');
const { setDbUserContext } = require('../config/db');

// almacenamiento de sesiones simple (para demo)
const sessions = new Map();

// =====================
// LOGIN
// =====================
const login = async (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: 'username y password son obligatorios' });
    }

    // Usuarios demo hardcodeados
    const usuarios = {
        'admin': { id: 1, password: 'admin123', roles: ['Administrador', 'Secretaría'] },
        'secre': { id: 2, password: 'secre123', roles: ['Secretaría'] },
        'asam':  { id: 3, password: 'asam123',  roles: ['Asambleísta'] }
    };

    const usuario = usuarios[username];
    if (!usuario || usuario.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, { id_usuario: usuario.id, roles: usuario.roles });

    return res.json({
        token,
        user: { username, roles: usuario.roles }
    });
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