const { sql, conectar } = require('../config/db');

// Listar todas las comisiones
const listarComisiones = async () => {
    await conectar();
    const result = await sql.query`
        SELECT 
            c.id_comision,
            c.nombre_comision,
            tc.nombre as tipo_comision
        FROM comision c
        LEFT JOIN catalogo_tipo_comision tc ON c.id_tipo_comision = tc.id_tipo_comision
        ORDER BY c.nombre_comision
    `;
    return result.recordset;
};

// Crear comisión
const crearComision = async (nombre_comision, id_tipo_comision) => {
    await conectar();
    await sql.query`
        INSERT INTO comision (nombre_comision, id_tipo_comision)
        VALUES (${nombre_comision}, ${id_tipo_comision})
    `;
};

// Obtener integrantes de una comisión
const obtenerIntegrantes = async (id_comision) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            ic.id_integrante_comision,
            a.asambleista_id,
            a.nombre,
            a.cedula,
            rc.nombre_rol as rol,
            ic.fecha_ingreso_nombramiento,
            ic.fecha_fin_nombramiento,
            ic.estado
        FROM integrante_comision ic
        JOIN asambleista a ON ic.id_asambleista = a.asambleista_id
        LEFT JOIN catalogo_rol_comision rc ON ic.id_rol_comision = rc.id_rol_comision
        WHERE ic.id_comision = ${id_comision}
        ORDER BY a.nombre
    `;
    return result.recordset;
};

// Agregar integrante a comisión
const agregarIntegrante = async (id_comision, id_asambleista, id_rol_comision, fecha_ingreso) => {
    await conectar();
    await sql.query`
        INSERT INTO integrante_comision 
            (id_comision, id_asambleista, id_rol_comision, fecha_ingreso_nombramiento, estado)
        VALUES 
            (${id_comision}, ${id_asambleista}, ${id_rol_comision}, ${fecha_ingreso}, 'activo')
    `;
};

// Registrar asistencia a sesión de comisión
const registrarAsistenciaComision = async (id_sesion_comision, asambleista_id, comision_id, id_estado_asistencia) => {
    await conectar();
    await sql.query`
        INSERT INTO asistencia_sesion_comision 
            (id_sesion_comision, asambleista_id, comision_id, id_estado_asistencia)
        VALUES 
            (${id_sesion_comision}, ${asambleista_id}, ${comision_id}, ${id_estado_asistencia})
    `;
};

// Calcular porcentaje de asistencia en comisión
const calcularAsistenciaComision = async (id_asambleista, id_comision) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            COUNT(*) as total_sesiones,
            SUM(CASE WHEN cat.nombre = 'Presente' THEN 1 ELSE 0 END) as sesiones_asistidas
        FROM asistencia_sesion_comision asc_
        JOIN catalogo_asistencia_sesion_comision cat 
            ON asc_.id_estado_asistencia = cat.id_estado_asistencia
        WHERE asc_.asambleista_id = ${id_asambleista}
          AND asc_.comision_id = ${id_comision}
    `;
    const datos = result.recordset[0];
    if (!datos || datos.total_sesiones === 0) return 0;
    return Math.round((datos.sesiones_asistidas / datos.total_sesiones) * 100);
};

module.exports = {
    listarComisiones,
    crearComision,
    obtenerIntegrantes,
    agregarIntegrante,
    registrarAsistenciaComision,
    calcularAsistenciaComision
};