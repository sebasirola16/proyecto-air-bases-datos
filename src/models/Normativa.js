const { sql, conectar } = require('../config/db');

const obtenerListadoReglamentos = async () => {
    const pool = await conectar();
    const result = await pool.request().query(`
        SELECT id_reglamento, nombre_normativa, sigla
        FROM reglamento
        ORDER BY nombre_normativa
    `);
    return result.recordset;
};

const crearReglamento = async (nombre_normativa, sigla) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('nombre', sql.NVarChar, nombre_normativa)
        .input('sigla', sql.NVarChar, sigla)
        .query(`
            DECLARE @ids TABLE (id_reglamento INT);
            INSERT INTO reglamento (nombre_normativa, sigla)
            OUTPUT INSERTED.id_reglamento INTO @ids
            VALUES (@nombre, @sigla);
            SELECT id_reglamento FROM @ids;
        `);
    return result.recordset[0];
};

const obtenerElementosPorReglamento = async (id_reglamento) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('id_reglamento', sql.Int, id_reglamento)
        .query(`
            WITH arbol AS (
                SELECT
                    e.id_elemento,
                    e.id_reglamento,
                    e.id_elemento_padre,
                    e.numero_etiqueta,
                    e.contenido_texto,
                    e.orden,
                    e.fecha_inicio_vigencia,
                    e.fecha_fin_vigencia,
                    n.nombre AS nivel,
                    v.nombre AS estado_vigencia,
                    0 AS profundidad
                FROM elemento_normativo e
                JOIN catalogo_nivel_reglamento n ON e.id_nivel_reglamento = n.id_nivel_reglamento
                JOIN catalogo_estado_vigencia  v ON e.id_estado_vigencia  = v.id_estado_vigencia
                WHERE e.id_reglamento     = @id_reglamento
                  AND e.id_elemento_padre IS NULL

                UNION ALL

                SELECT
                    e.id_elemento,
                    e.id_reglamento,
                    e.id_elemento_padre,
                    e.numero_etiqueta,
                    e.contenido_texto,
                    e.orden,
                    e.fecha_inicio_vigencia,
                    e.fecha_fin_vigencia,
                    n.nombre AS nivel,
                    v.nombre AS estado_vigencia,
                    a.profundidad + 1
                FROM elemento_normativo e
                JOIN catalogo_nivel_reglamento n ON e.id_nivel_reglamento = n.id_nivel_reglamento
                JOIN catalogo_estado_vigencia  v ON e.id_estado_vigencia  = v.id_estado_vigencia
                JOIN arbol a ON e.id_elemento_padre = a.id_elemento
            )
            SELECT * FROM arbol ORDER BY profundidad ASC, orden ASC
        `);
    return result.recordset;
};

const agregarElementoNormativo = async (datos) => {
    const pool = await conectar();
    const {
        id_reglamento, id_elemento_padre, id_nivel_reglamento,
        numero_etiqueta, contenido_texto, orden,
        fecha_inicio_vigencia, id_estado_vigencia
    } = datos;

    const result = await pool.request()
        .input('id_reglamento',       sql.Int,      id_reglamento)
        .input('id_elemento_padre',   sql.Int,      id_elemento_padre || null)
        .input('id_nivel_reglamento', sql.Int,      id_nivel_reglamento)
        .input('numero_etiqueta',     sql.NVarChar, numero_etiqueta)
        .input('contenido_texto',     sql.NVarChar, contenido_texto)
        .input('orden',               sql.Int,      orden)
        .input('fecha_inicio',        sql.Date,     fecha_inicio_vigencia || null)
        .input('id_estado_vigencia',  sql.Int,      id_estado_vigencia)
        .query(`
            DECLARE @ids TABLE (id_elemento INT);
            INSERT INTO elemento_normativo (
                id_reglamento, id_elemento_padre, id_nivel_reglamento,
                numero_etiqueta, contenido_texto, orden,
                fecha_inicio_vigencia, id_estado_vigencia
            )
            OUTPUT INSERTED.id_elemento INTO @ids
            VALUES (
                @id_reglamento, @id_elemento_padre, @id_nivel_reglamento,
                @numero_etiqueta, @contenido_texto, @orden,
                @fecha_inicio, @id_estado_vigencia
            );
            SELECT id_elemento FROM @ids;
        `);
    return result.recordset[0];
};

const publicarNuevaVersion = async (datos) => {
    const pool = await conectar();
    const {
        id_reglamento, id_elemento_padre, id_nivel_reglamento,
        numero_etiqueta, contenido_texto, orden, id_estado_vigencia
    } = datos;

    const result = await pool.request()
        .input('id_reglamento',       sql.Int,      id_reglamento)
        .input('id_elemento_padre',   sql.Int,      id_elemento_padre || null)
        .input('id_nivel_reglamento', sql.Int,      id_nivel_reglamento)
        .input('numero_etiqueta',     sql.NVarChar, numero_etiqueta)
        .input('contenido_texto',     sql.NVarChar, contenido_texto)
        .input('orden',               sql.Int,      orden)
        .input('id_estado_vigencia',  sql.Int,      id_estado_vigencia)
        .query(`
            DECLARE @ids TABLE (id_elemento INT);
            INSERT INTO elemento_normativo (
                id_reglamento, id_elemento_padre, id_nivel_reglamento,
                numero_etiqueta, contenido_texto, orden,
                fecha_inicio_vigencia, id_estado_vigencia
            )
            OUTPUT INSERTED.id_elemento INTO @ids
            VALUES (
                @id_reglamento, @id_elemento_padre, @id_nivel_reglamento,
                @numero_etiqueta, @contenido_texto, @orden,
                CAST(GETDATE() AS DATE), @id_estado_vigencia
            );
            SELECT id_elemento FROM @ids;
        `);
    return result.recordset[0];
};

const obtenerNiveles = async () => {
    const pool = await conectar();
    const result = await pool.request().query(`
        SELECT id_nivel_reglamento, nombre
        FROM catalogo_nivel_reglamento
        ORDER BY id_nivel_reglamento ASC
    `);
    return result.recordset;
};

const obtenerEstadosVigencia = async () => {
    const pool = await conectar();
    const result = await pool.request().query(`
        SELECT id_estado_vigencia, nombre
        FROM catalogo_estado_vigencia
    `);
    return result.recordset;
};

const contarElementosPorReglamento = async (id_reglamento) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('id_reglamento', sql.Int, id_reglamento)
        .query(`
            SELECT COUNT(*) as total
            FROM elemento_normativo
            WHERE id_reglamento = @id_reglamento
        `);
    return result.recordset[0].total;
};

module.exports = {
    obtenerListadoReglamentos,
    crearReglamento,
    obtenerElementosPorReglamento,
    agregarElementoNormativo,
    publicarNuevaVersion,
    obtenerNiveles,
    obtenerEstadosVigencia,
    contarElementosPorReglamento
};