const { sql, conectar } = require('../config/db');

// Obtener historial completo de un asambleísta para certificación
const obtenerHistorialAsambleista = async (asambleista_id) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('asambleista_id', sql.Int, asambleista_id)
        .query(`
            SELECT
                a.asambleista_id,
                a.cedula,
                a.nombre,
                a.correo_institucional,
                n.fecha_inicio,
                n.fecha_fin,
                n.estado as estado_nombramiento,
                s.nombre as sector
            FROM asambleista a
            LEFT JOIN nombramiento n ON a.asambleista_id = n.asambleista_id
            LEFT JOIN catalogo_sector s ON n.sector_id = s.id_sector
            WHERE a.asambleista_id = @asambleista_id
            ORDER BY n.fecha_inicio DESC
        `);
    return { datos: result.recordset };
};

// Generar folio único DAIR-XXX-AAAA (contador simple en control_folio)
const generarFolio = async () => {
    const pool = await conectar();
    const anio = new Date().getFullYear();

    // Ver si ya existe una fila de contador
    const existe = await pool.request().query(`
        SELECT TOP 1 folio_id, numero_folio
        FROM control_folio
        ORDER BY folio_id ASC
    `);

    let numero;
    if (existe.recordset.length === 0) {
        // No hay contador todavía: crear la primera fila
        await pool.request().query(`
            INSERT INTO control_folio (numero_folio) VALUES (1)
        `);
        numero = 1;
    } else {
        // Incrementar el contador existente
        const folio_id = existe.recordset[0].folio_id;
        const result = await pool.request()
            .input('folio_id', sql.Int, folio_id)
            .query(`
                UPDATE control_folio
                SET numero_folio = numero_folio + 1
                OUTPUT INSERTED.numero_folio
                WHERE folio_id = @folio_id
            `);
        numero = result.recordset[0].numero_folio;
    }

    const numeroFormateado = String(numero).padStart(3, '0');
    return `DAIR-${numeroFormateado}-${anio}`;
};

// Registrar certificación emitida
const registrarCertificacion = async (asambleista_id, folio, hash_documento, usuario_secretaria) => {
    const pool = await conectar();
    await pool.request()
        .input('asambleista_id',     sql.Int,      asambleista_id)
        .input('folio',              sql.NVarChar, folio)
        .input('hash_documento',     sql.NVarChar, hash_documento)
        .input('usuario_secretaria', sql.NVarChar, usuario_secretaria)
        .query(`
            INSERT INTO certificacion_emitida
                (asambleista_id, folio, hash_documento, fecha, usuario_secretaria)
            VALUES
                (@asambleista_id, @folio, @hash_documento, GETDATE(), @usuario_secretaria)
        `);
};

// Obtener certificaciones emitidas
const listarCertificaciones = async () => {
    const pool = await conectar();
    const result = await pool.request().query(`
        SELECT
            ce.certificacion_id,
            ce.folio,
            ce.hash_documento,
            ce.fecha,
            ce.usuario_secretaria,
            a.nombre as asambleista,
            a.cedula
        FROM certificacion_emitida ce
        JOIN asambleista a ON ce.asambleista_id = a.asambleista_id
        ORDER BY ce.fecha DESC
    `);
    return result.recordset;
};

module.exports = {
    obtenerHistorialAsambleista,
    generarFolio,
    registrarCertificacion,
    listarCertificaciones
};