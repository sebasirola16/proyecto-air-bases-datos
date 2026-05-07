const { sql } = require('../config/db');

// Obtener todos los asambleistas
const listarAsambleistas = async () => {
    const result = await sql.query`
        SELECT 
            a.asambleista_id,
            a.cedula,
            a.nombre,
            a.correo_institucional,
            a.activo,
            n.estado as estado_nombramiento,
            s.nombre as sector
        FROM asambleista a
        LEFT JOIN nombramiento n ON a.asambleista_id = n.asambleista_id
            AND n.estado = 'ACTIVO'
        LEFT JOIN catalogo_sector s ON n.sector_id = s.id_sector
    `;
    return result.recordset;
};

// Obtener un asambleista por cedula
const obtenerPorCedula = async (cedula) => {
    const result = await sql.query`
        SELECT 
            a.asambleista_id,
            a.cedula,
            a.nombre,
            a.correo_institucional,
            a.activo
        FROM asambleista a
        WHERE a.cedula = ${cedula}
    `;
    return result.recordset[0];
};

// Crear asambleista
const crearAsambleista = async (cedula, nombre, correo) => {
    await sql.query`
        INSERT INTO asambleista (cedula, nombre, correo_institucional)
        VALUES (${cedula}, ${nombre}, ${correo})
    `;
};

// Editar asambleista
const editarAsambleista = async (id, nombre, correo) => {
    await sql.query`
        UPDATE asambleista
        SET nombre = ${nombre},
            correo_institucional = ${correo}
        WHERE asambleista_id = ${id}
    `;
};

module.exports = {
    listarAsambleistas,
    obtenerPorCedula,
    crearAsambleista,
    editarAsambleista
};