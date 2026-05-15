const crypto = require('crypto');
const { sql, conectar, setDbUserContext } = require('../config/db');

// Token store en memoria (suficiente para demo Semana 2)
const sessions = new Map(); // token -> { id_usuario, roles: [] }

const hashSha256Hex = (text) =>
  crypto.createHash('sha256').update(text, 'utf8').digest('hex');

const login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username y password son obligatorios' });
  }

  try {
    await conectar();
    const passHash = hashSha256Hex(password);

    // Obtener usuario
    const userResult = await sql.query`
      SELECT id_usuario, username, email, activo
      FROM sys_usuario
      WHERE username = ${username} AND password_hash = ${passHash} AND activo = 1;
    `;

    const user = userResult.recordset[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Obtener roles
    const rolesResult = await sql.query`
      SELECT r.nombre_rol
      FROM sys_usuario_rol ur
      JOIN sys_rol r ON ur.id_rol = r.id_rol
      WHERE ur.id_usuario = ${user.id_usuario};
    `;

    const roles = rolesResult.recordset.map(r => r.nombre_rol);

    // Crear token
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, { id_usuario: user.id_usuario, roles });

    return res.json({
      token,
      user: { id_usuario: user.id_usuario, username: user.username, email: user.email, roles }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en login' });
  }
};

// Middleware: autenticar por token
const requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  req.auth = sessions.get(token);

  // Setear contexto de BD para auditoría (triggers)
  try {
    await setDbUserContext(req.auth.id_usuario);
  } catch (e) {
    // Si falla, no bloqueamos (pero idealmente debería funcionar)
    console.warn('No se pudo setear SESSION_CONTEXT:', e.message);
  }

  next();
};

// Middleware: autorización por rol
const requireRole = (roleName) => (req, res, next) => {
  const roles = req.auth?.roles || [];
  if (!roles.includes(roleName)) {
    return res.status(403).json({ error: 'Acceso denegado por rol' });
  }
  next();
};

module.exports = { login, requireAuth, requireRole };
const express = require('express');
const { login, requireAuth, requireRole } = require('./src/controllers/AuthController');

app.post('/api/login', login);

// Ejemplo: proteger normativa 
app.post('/api/normativa/*', requireAuth, requireRole('Secretaría'), handler);