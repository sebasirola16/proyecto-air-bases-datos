const { sql, conectar } = require('../config/db');

// Listar todas las propuestas
const listarPropuestas = async () => {
    await conectar();
    const result = await sql.query`
        SELECT 
            p.id_propuesta,
            p.titulo,
            p.codigo_air,
            ep.nombre as etapa,
            esp.nombre as estado
        FROM propuesta p
        LEFT JOIN catalogo_etapas_propuestas ep ON p.id_etapa_propuesta = ep.id_etapa_propuesta
        LEFT JOIN catalogo_estado_propuestas esp ON p.id_estado_propuesta = esp.id_estado_propuesta
        ORDER BY p.id_propuesta DESC
    `;
    return result.recordset;
};

// Obtener propuesta por ID
const obtenerPropuestaPorId = async (id_propuesta) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            p.id_propuesta,
            p.titulo,
            p.codigo_air,
            p.texto_sustitutivo,
            ep.nombre as etapa,
            esp.nombre as estado
        FROM propuesta p
        LEFT JOIN catalogo_etapas_propuestas ep ON p.id_etapa_propuesta = ep.id_etapa_propuesta
        LEFT JOIN catalogo_estado_propuestas esp ON p.id_estado_propuesta = esp.id_estado_propuesta
        WHERE p.id_propuesta = ${id_propuesta}
    `;
    return result.recordset[0];
};

// Crear propuesta
const crearPropuesta = async (titulo, id_etapa_propuesta, id_estado_propuesta, texto_sustitutivo, codigo_air) => {
    await conectar();
    await sql.query`
        INSERT INTO propuesta 
            (titulo, id_etapa_propuesta, id_estado_propuesta, texto_sustitutivo, codigo_air)
        VALUES 
            (${titulo}, ${id_etapa_propuesta}, ${id_estado_propuesta}, ${texto_sustitutivo}, ${codigo_air})
    `;
};

// Agregar proponente a propuesta
const agregarProponente = async (id_propuesta, id_asambleista) => {
    await conectar();
    await sql.query`
        INSERT INTO proponente_propuesta (id_propuesta, id_asambleista, fecha_registro)
        VALUES (${id_propuesta}, ${id_asambleista}, GETDATE())
    `;
};

// Obtener proponentes de una propuesta
const obtenerProponentes = async (id_propuesta) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            a.asambleista_id,
            a.nombre,
            a.cedula,
            pp.fecha_registro
        FROM proponente_propuesta pp
        JOIN asambleista a ON pp.id_asambleista = a.asambleista_id
        WHERE pp.id_propuesta = ${id_propuesta}
        ORDER BY a.nombre
    `;
    return result.recordset;
};

// Actualizar estado de propuesta
const actualizarEstado = async (id_propuesta, id_estado_propuesta) => {
    await conectar();
    await sql.query`
        UPDATE propuesta
        SET id_estado_propuesta = ${id_estado_propuesta}
        WHERE id_propuesta = ${id_propuesta}
    `;
};

module.exports = {
    listarPropuestas,
    obtenerPropuestaPorId,
    crearPropuesta,
    agregarProponente,
    obtenerProponentes,
    actualizarEstado
};