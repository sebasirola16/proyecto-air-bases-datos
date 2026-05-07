const { sql } = require('../config/db');

// Listar nombramientos de un asambleista
const listarNombramientos = async (asambleista_id) => {
    const result = await sql.query`
        SELECT 
            n.id_nombramiento,
            n.fecha_inicio,
            n.fecha_fin,
            n.estado,
            s.nombre as sector,
            p.nombre_puesto as puesto
        FROM nombramiento n
        JOIN catalogo_sector s ON n.sector_id = s.id_sector
        LEFT JOIN catalogo_puestos p ON n.id_puesto = p.id_puesto
        WHERE n.asambleista_id = ${asambleista_id}
        ORDER BY n.fecha_inicio DESC
    `;
    return result.recordset;
};

// Crear nombramiento
const crearNombramiento = async (asambleista_id, sector_id, id_puesto, fecha_inicio) => {
    await sql.query`
        INSERT INTO nombramiento 
            (asambleista_id, sector_id, id_puesto, fecha_inicio, estado)
        VALUES 
            (${asambleista_id}, ${sector_id}, ${id_puesto}, ${fecha_inicio}, 'ACTIVO')
    `;
};

// Concluir nombramiento activo
const concluirNombramiento = async (id_nombramiento, fecha_fin) => {
    await sql.query`
        UPDATE nombramiento
        SET estado = 'CONCLUIDO',
            fecha_fin = ${fecha_fin}
        WHERE id_nombramiento = ${id_nombramiento}
    `;
};

// Listar sectores disponibles
const listarSectores = async () => {
    const result = await sql.query`
        SELECT id_sector, nombre 
        FROM catalogo_sector
    `;
    return result.recordset;
};

// Listar puestos disponibles
const listarPuestos = async () => {
    const result = await sql.query`
        SELECT id_puesto, nombre_puesto 
        FROM catalogo_puestos
    `;
    return result.recordset;
};

module.exports = {
    listarNombramientos,
    crearNombramiento,
    concluirNombramiento,
    listarSectores,
    listarPuestos
};