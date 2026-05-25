const { sql, conectar } = require('../config/db');

// Obtener todos los reglamentos
const obtenerListadoReglamentos = async () => {
    await conectar();
    const result = await sql.query`
        SELECT id_reglamento, nombre_normativa, sigla
        FROM reglamento
        ORDER BY nombre_normativa
    `;
    return result.recordset;
};

// Crear reglamento
const crearReglamento = async (nombre_normativa, sigla) => {
    await conectar();
    await sql.query`
        INSERT INTO reglamento (nombre_normativa, sigla)
        VALUES (${nombre_normativa}, ${sigla})
    `;
};

// Obtener elementos por reglamento (árbol recursivo)
const obtenerElementosPorReglamento = async (id_reglamento) => {
    await conectar();
    const result = await sql.query`
        WITH arbol AS (
            SELECT 
                id_elemento,
                id_reglamento,
                id_elemento_padre,
                id_nivel_reglamento,
                numero_etiqueta,
                contenido_texto,
                orden,
                fecha_inicio_vigencia,
                fecha_fin_vigencia,
                id_estado_vigencia,
                0 AS nivel
            FROM elemento_normativo
            WHERE id_reglamento = ${id_reglamento}
              AND id_elemento_padre IS NULL
              AND fecha_fin_vigencia IS NULL

            UNION ALL

            SELECT 
                e.id_elemento,
                e.id_reglamento,
                e.id_elemento_padre,
                e.id_nivel_reglamento,
                e.numero_etiqueta,
                e.contenido_texto,
                e.orden,
                e.fecha_inicio_vigencia,
                e.fecha_fin_vigencia,
                e.id_estado_vigencia,
                a.nivel + 1
            FROM elemento_normativo e
            INNER JOIN arbol a ON e.id_elemento_padre = a.id_elemento
            WHERE e.fecha_fin_vigencia IS NULL
        )
        SELECT * FROM arbol ORDER BY nivel, orden
    `;
    return result.recordset;
};

// Agregar elemento normativo
const agregarElementoNormativo = async (id_reglamento, id_elemento_padre, id_nivel_reglamento, numero_etiqueta, contenido_texto, orden) => {
    await conectar();
    await sql.query`
        INSERT INTO elemento_normativo 
            (id_reglamento, id_elemento_padre, id_nivel_reglamento, numero_etiqueta, contenido_texto, orden, fecha_inicio_vigencia, id_estado_vigencia)
        VALUES 
            (${id_reglamento}, ${id_elemento_padre}, ${id_nivel_reglamento}, ${numero_etiqueta}, ${contenido_texto}, ${orden}, GETDATE(), 1)
    `;
};

// Contar elementos por reglamento
const contarElementosPorReglamento = async (id_reglamento) => {
    await conectar();
    const result = await sql.query`
        SELECT COUNT(*) as total
        FROM elemento_normativo
        WHERE id_reglamento = ${id_reglamento}
          AND fecha_fin_vigencia IS NULL
    `;
    return result.recordset[0].total;
};

module.exports = {
    obtenerListadoReglamentos,
    crearReglamento,
    obtenerElementosPorReglamento,
    agregarElementoNormativo,
    contarElementosPorReglamento
};