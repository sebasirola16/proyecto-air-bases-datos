const { sql, conectar } = require('../config/db');

// Listar todas las sesiones
const listarSesiones = async () => {
    const pool = await conectar();
    const result = await pool.request().query(`
        SELECT
            s.sesion_id,
            s.numero_sesion,
            s.fecha,
            s.quorum_requerido,
            s.estado,
            ts.nombre as tipo_sesion,
            tm.nombre as tipo_modalidad
        FROM sesiones s
        LEFT JOIN catalogo_tipo_sesion ts ON s.id_tipo_sesion = ts.id_tipo_sesion
        LEFT JOIN catalogo_tipo_modalidad tm ON s.id_tipo_modalidad = tm.id_tipo_modalidad
        ORDER BY s.fecha DESC
    `);
    return result.recordset;
};

// Obtener sesión por ID
const obtenerSesionPorId = async (id_sesion) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('id_sesion', sql.Int, id_sesion)
        .query(`
            SELECT
                s.sesion_id,
                s.numero_sesion,
                s.fecha,
                s.quorum_requerido,
                s.link_acta,
                s.estado,
                ts.nombre as tipo_sesion,
                tm.nombre as tipo_modalidad
            FROM sesiones s
            LEFT JOIN catalogo_tipo_sesion ts ON s.id_tipo_sesion = ts.id_tipo_sesion
            LEFT JOIN catalogo_tipo_modalidad tm ON s.id_tipo_modalidad = tm.id_tipo_modalidad
            WHERE s.sesion_id = @id_sesion
        `);
    return result.recordset[0];
};

// Crear sesión
const crearSesion = async (numero_sesion, fecha, id_tipo_sesion, id_tipo_modalidad, quorum_requerido) => {
    const pool = await conectar();
    await pool.request()
        .input('numero_sesion',     sql.Int,      numero_sesion)
        .input('fecha',             sql.DateTime, fecha)
        .input('id_tipo_sesion',    sql.Int,      id_tipo_sesion)
        .input('id_tipo_modalidad', sql.Int,      id_tipo_modalidad)
        .input('quorum_requerido',  sql.Int,      quorum_requerido)
        .query(`
            INSERT INTO sesiones (numero_sesion, fecha, id_tipo_sesion, id_tipo_modalidad, quorum_requerido, estado)
            VALUES (@numero_sesion, @fecha, @id_tipo_sesion, @id_tipo_modalidad, @quorum_requerido, 'Abierta')
        `);
};

// Registrar asistencia a sesión (tabla real: sesion_id, asambleista_id, presente)
const registrarAsistencia = async (id_sesion, id_asambleista, presente) => {
    const pool = await conectar();
    await pool.request()
        .input('id_sesion',      sql.Int, id_sesion)
        .input('id_asambleista', sql.Int, id_asambleista)
        .input('presente',       sql.Bit, presente)
        .query(`
            INSERT INTO asistencia_sesion_plenaria (sesion_id, asambleista_id, presente)
            VALUES (@id_sesion, @id_asambleista, @presente)
        `);
};

// Marcar asistencia: si ya existe el registro lo actualiza, si no lo crea
const marcarAsistencia = async (id_sesion, id_asambleista, presente) => {
    const pool = await conectar();
    await pool.request()
        .input('id_sesion',      sql.Int, id_sesion)
        .input('id_asambleista', sql.Int, id_asambleista)
        .input('presente',       sql.Bit, presente)
        .query(`
            IF EXISTS (SELECT 1 FROM asistencia_sesion_plenaria
                       WHERE sesion_id = @id_sesion AND asambleista_id = @id_asambleista)
                UPDATE asistencia_sesion_plenaria
                SET presente = @presente
                WHERE sesion_id = @id_sesion AND asambleista_id = @id_asambleista;
            ELSE
                INSERT INTO asistencia_sesion_plenaria (sesion_id, asambleista_id, presente)
                VALUES (@id_sesion, @id_asambleista, @presente);
        `);
};

// Obtener asistencia de una sesión
const obtenerAsistencia = async (id_sesion) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('id_sesion', sql.Int, id_sesion)
        .query(`
            SELECT
                a.asambleista_id,
                a.nombre,
                a.cedula,
                asp.presente
            FROM asambleista a
            LEFT JOIN asistencia_sesion_plenaria asp
                ON a.asambleista_id = asp.asambleista_id
                AND asp.sesion_id = @id_sesion
            WHERE a.activo = 1
            ORDER BY a.nombre
        `);
    return result.recordset;
};

// Calcular quórum de una sesión
const calcularQuorum = async (id_sesion) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('id_sesion', sql.Int, id_sesion)
        .query(`
            SELECT
                COUNT(CASE WHEN asp.presente = 1 THEN 1 END) as total_presentes,
                s.quorum_requerido
            FROM sesiones s
            LEFT JOIN asistencia_sesion_plenaria asp ON s.sesion_id = asp.sesion_id
            WHERE s.sesion_id = @id_sesion
            GROUP BY s.quorum_requerido
        `);
    return result.recordset[0];
};

module.exports = {
    listarSesiones,
    obtenerSesionPorId,
    crearSesion,
    registrarAsistencia,
    marcarAsistencia,
    obtenerAsistencia,
    calcularQuorum
};