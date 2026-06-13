const { sql, conectar } = require('../config/db');

// Listar registros de la bitácora de auditoría, con filtros opcionales
const listarBitacora = async (desde, hasta, accion) => {
    const pool = await conectar();
    const request = pool.request();

    let query = `
        SELECT
            id_log,
            id_usuario,
            accion,
            tabla_afectada,
            registro_id,
            detalle,
            fecha_hora
        FROM sys_log_auditoria
        WHERE 1 = 1
    `;

    if (desde) {
        request.input('desde', sql.DateTime2, desde);
        query += ` AND fecha_hora >= @desde`;
    }
    if (hasta) {
        request.input('hasta', sql.DateTime2, hasta + ' 23:59:59');
        query += ` AND fecha_hora <= @hasta`;
    }
    if (accion) {
        request.input('accion', sql.NVarChar, accion);
        query += ` AND accion = @accion`;
    }

    query += ` ORDER BY fecha_hora DESC`;

    const result = await request.query(query);
    return result.recordset;
};

module.exports = { listarBitacora };