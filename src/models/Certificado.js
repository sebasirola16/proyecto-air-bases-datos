const { sql, conectar } = require('../config/db');

// Obtener historial completo de un asambleísta para certificación
const obtenerHistorialAsambleista = async (asambleista_id) => {
    await conectar();

    // Datos personales y nombramientos
    const datosResult = await sql.query`
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
        WHERE a.asambleista_id = ${asambleista_id}
        ORDER BY n.fecha_inicio DESC
    `;

    // Asistencia a sesiones plenarias
    const asistenciaResult = await sql.query`
        SELECT 
            COUNT(*) as total_sesiones,
            SUM(CASE WHEN cat.nombre = 'Presente' THEN 1 ELSE 0 END) as sesiones_asistidas
        FROM asistencia_sesion_plenaria asp
        JOIN sesiones s ON asp.id_sesion = s.id_sesion
        JOIN catalogo_asistencia_sesion_comision cat 
            ON asp.id_estado_asistencia = cat.id_estado_asistencia
        WHERE asp.id_asambleista = ${asambleista_id}
    `;

    return {
        datos: datosResult.recordset,
        asistencia: asistenciaResult.recordset[0]
    };
};

// Generar folio único para certificación
const generarFolio = async () => {
    await conectar();
    const anio = new Date().getFullYear();

    // Obtener y actualizar el último número de folio
    const result = await sql.query`
        UPDATE control_folio
        SET ultimo_numero = ultimo_numero + 1,
            fecha_actualizacion = GETDATE()
        OUTPUT INSERTED.ultimo_numero
        WHERE año = ${anio}
    `;

    // Si no existe el registro para este año, crearlo
    if (result.recordset.length === 0) {
        await sql.query`
            INSERT INTO control_folio (año, ultimo_numero, fecha_actualizacion)
            VALUES (${anio}, 1, GETDATE())
        `;
        return `DAIR-001-${anio}`;
    }

    const numero = result.recordset[0].ultimo_numero;
    const numeroFormateado = String(numero).padStart(3, '0');
    return `DAIR-${numeroFormateado}-${anio}`;
};

// Registrar certificación emitida
const registrarCertificacion = async (id_asambleista, folio_unico, hash_seguridad, usuario_secretaria) => {
    await conectar();
    await sql.query`
        INSERT INTO certificacion_emitida 
            (id_asambleista, folio_unico, hash_seguridad, fecha_emision, usuario_secretaria)
        VALUES 
            (${id_asambleista}, ${folio_unico}, ${hash_seguridad}, GETDATE(), ${usuario_secretaria})
    `;
};

// Obtener certificaciones emitidas
const listarCertificaciones = async () => {
    await conectar();
    const result = await sql.query`
        SELECT 
            ce.id_certificacion,
            ce.folio_unico,
            ce.hash_seguridad,
            ce.fecha_emision,
            ce.usuario_secretaria,
            a.nombre as asambleista,
            a.cedula
        FROM certificacion_emitida ce
        JOIN asambleista a ON ce.id_asambleista = a.asambleista_id
        ORDER BY ce.fecha_emision DESC
    `;
    return result.recordset;
};

module.exports = {
    obtenerHistorialAsambleista,
    generarFolio,
    registrarCertificacion,
    listarCertificaciones
};