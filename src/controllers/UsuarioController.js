const Usuario = require('../models/Usuario');

const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.listarUsuarios();
        res.json(usuarios);
    } catch (err) {
        console.error('listarUsuarios:', err);
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
};

const listarRoles = async (req, res) => {
    try {
        const roles = await Usuario.listarRoles();
        res.json(roles);
    } catch (err) {
        console.error('listarRoles:', err);
        res.status(500).json({ error: 'Error al listar roles' });
    }
};

const crearUsuario = async (req, res) => {
    try {
        const { username, password, email, rol } = req.body;
        const id_rol = rol;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
        }
        const nuevo = await Usuario.crearUsuario(username, password, email, id_rol);
        res.status(201).json({ mensaje: 'Usuario creado correctamente', id: nuevo.id_usuario });
    } catch (err) {
        console.error('crearUsuario:', err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

module.exports = {
    listarUsuarios,
    listarRoles,
    crearUsuario
};