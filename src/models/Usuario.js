const { sql, conectar } = require('../config/db');
const crypto = require('crypto');

// Listar usuarios con su rol
const listarUsuarios = async () => {
    const pool = await conectar();
    const result = await pool.request().query(`
        SELECT
            u.id_usuario,
            u.username,
            u.email,
            u.activo,
            r.nombre_rol as rol
        FROM sys_usuario u
        LEFT JOIN sys_usuario_rol ur ON u.id_usuario = ur.id_usuario
        LEFT JOIN sys_rol r ON ur.id_rol = r.id_rol
        ORDER BY u.username
    `);
    return result.recordset;
};

// Listar los roles disponibles (para el dropdown)
const listarRoles = async () => {
    const pool = await conectar();
    const result = await pool.request().query(`
        SELECT id_rol, nombre_rol
        FROM sys_rol
        ORDER BY id_rol
    `);
    return result.recordset;
};

// Crear usuario con contraseña hasheada (SHA-256) y asignarle un rol
const crearUsuario = async (username, password, email, id_rol) => {
    const pool = await conectar();
    const password_hash = crypto.createHash('sha256').update(password).digest('hex');

    // Insertar el usuario y recuperar su id (con tabla temporal por los triggers)
    const result = await pool.request()
        .input('username',      sql.NVarChar, username)
        .input('password_hash', sql.NVarChar, password_hash)
        .input('email',         sql.NVarChar, email)
        .query(`
            DECLARE @ids TABLE (id_usuario INT);
            INSERT INTO sys_usuario (username, password_hash, email, activo)
            OUTPUT INSERTED.id_usuario INTO @ids
            VALUES (@username, @password_hash, @email, 1);
            SELECT id_usuario FROM @ids;
        `);
    const nuevoId = result.recordset[0].id_usuario;

    // Asignar el rol en la tabla puente
    if (id_rol) {
        await pool.request()
            .input('id_usuario', sql.Int, nuevoId)
            .input('id_rol',     sql.Int, id_rol)
            .query(`
                INSERT INTO sys_usuario_rol (id_usuario, id_rol)
                VALUES (@id_usuario, @id_rol)
            `);
    }

    return { id_usuario: nuevoId };
};

module.exports = {
    listarUsuarios,
    listarRoles,
    crearUsuario
};