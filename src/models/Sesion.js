const { sql, conectar } = require('../config/db');

// Listar todas las sesiones
const listarSesiones = async () => {
    await conectar();
    const result = await sql.query`
        SELECT 
            s.id_sesion,
            s.numero_sesion,
            s.fecha,
            s.quorum_requerido,
            ts.nombre as tipo_sesion,
            tm.nombre as tipo_modalidad
        FROM sesiones s
        LEFT JOIN catalogo_tipo_sesion ts ON s.id_tipo_sesion = ts.id_tipo_sesion
        LEFT JOIN catalogo_tipo_modalidad tm ON s.id_tipo_modalidad = tm.id_tipo_modalidad
        ORDER BY s.fecha DESC
    `;
    return result.recordset;
};

// Obtener sesión por ID
const obtenerSesionPorId = async (id_sesion) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            s.id_sesion,
            s.numero_sesion,
            s.fecha,
            s.quorum_requerido,
            s.link_acta,
            ts.nombre as tipo_sesion,
            tm.nombre as tipo_modalidad
        FROM sesiones s
        LEFT JOIN catalogo_tipo_sesion ts ON s.id_tipo_sesion = ts.id_tipo_sesion
        LEFT JOIN catalogo_tipo_modalidad tm ON s.id_tipo_modalidad = tm.id_tipo_modalidad
        WHERE s.id_sesion = ${id_sesion}
    `;
    return result.recordset[0];
};

// Crear sesión
const crearSesion = async (numero_sesion, fecha, id_tipo_sesion, id_tipo_modalidad, quorum_requerido) => {
    await conectar();
    await sql.query`
        INSERT INTO sesiones (numero_sesion, fecha, id_tipo_sesion, id_tipo_modalidad, quorum_requerido)
        VALUES (${numero_sesion}, ${fecha}, ${id_tipo_sesion}, ${id_tipo_modalidad}, ${quorum_requerido})
    `;
};

// Registrar asistencia a sesión
const registrarAsistencia = async (id_sesion, id_asambleista, id_estado_asistencia) => {
    await conectar();
    await sql.query`
        INSERT INTO asistencia_sesion_plenaria (id_sesion, id_asambleista, id_estado_asistencia)
        VALUES (${id_sesion}, ${id_asambleista}, ${id_estado_asistencia})
    `;
};

// Obtener asistencia de una sesión
const obtenerAsistencia = async (id_sesion) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            a.asambleista_id,
            a.nombre,
            a.cedula,
            asp.id_estado_asistencia,
            cat.nombre as estado_asistencia
        FROM asambleista a
        LEFT JOIN asistencia_sesion_plenaria asp 
            ON a.asambleista_id = asp.id_asambleista 
            AND asp.id_sesion = ${id_sesion}
        LEFT JOIN catalogo_asistencia_sesion_comision cat 
            ON asp.id_estado_asistencia = cat.id_estado_asistencia
        WHERE a.activo = 1
        ORDER BY a.nombre
    `;
    return result.recordset;
};

// Calcular quórum de una sesión
const calcularQuorum = async (id_sesion) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            COUNT(*) as total_presentes,
            s.quorum_requerido
        FROM asistencia_sesion_plenaria asp
        JOIN sesiones s ON asp.id_sesion = s.id_sesion
        WHERE asp.id_sesion = ${id_sesion}
          AND asp.id_estado_asistencia = 1
        GROUP BY s.quorum_requerido
    `;
    return result.recordset[0];
};

module.exports = {
    listarSesiones,
    obtenerSesionPorId,
    crearSesion,
    registrarAsistencia,
    obtenerAsistencia,
    calcularQuorum
};