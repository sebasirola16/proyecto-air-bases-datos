const { sql, conectar } = require('../config/db');

// Registrar resultado de votación
const registrarVotacion = async (id_sesion, id_propuesta, votos_favor, votos_contra, abstenciones, tipo_mayoria) => {
    const pool = await conectar();
    await pool.request()
        .input('id_sesion',    sql.Int,      id_sesion)
        .input('id_propuesta', sql.Int,      id_propuesta)
        .input('votos_favor',  sql.Int,      votos_favor)
        .input('votos_contra', sql.Int,      votos_contra)
        .input('abstenciones', sql.Int,      abstenciones)
        .input('tipo_mayoria', sql.NVarChar, tipo_mayoria)
        .query(`
            INSERT INTO votaciones_acuerdos
                (id_sesion, id_propuesta, votos_favor, votos_contra, abstenciones, tipo_mayoria)
            VALUES
                (@id_sesion, @id_propuesta, @votos_favor, @votos_contra, @abstenciones, @tipo_mayoria)
        `);
};

// Obtener votaciones de una sesión
const obtenerVotacionesPorSesion = async (id_sesion) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('id_sesion', sql.Int, id_sesion)
        .query(`
            SELECT
                v.id_votacion,
                v.votos_favor,
                v.votos_contra,
                v.abstenciones,
                v.tipo_mayoria,
                p.titulo as propuesta
            FROM votaciones_acuerdos v
            JOIN propuesta p ON v.id_propuesta = p.id_propuesta
            WHERE v.id_sesion = @id_sesion
        `);
    return result.recordset;
};

// Calcular resultado de votación
const calcularResultado = (votos_favor, votos_contra, abstenciones, tipo_mayoria) => {
    const total_votos = votos_favor + votos_contra + abstenciones;

    if (tipo_mayoria === 'SIMPLE') {
        const mayoria_requerida = Math.floor(total_votos / 2) + 1;
        return {
            aprobado: votos_favor >= mayoria_requerida,
            resultado: votos_favor >= mayoria_requerida ? 'APROBADA' : 'RECHAZADA',
            votos_requeridos: mayoria_requerida,
            votos_favor,
            votos_contra,
            abstenciones
        };
    } else if (tipo_mayoria === 'CALIFICADA') {
        const mayoria_requerida = Math.ceil(total_votos * 0.66);
        return {
            aprobado: votos_favor >= mayoria_requerida,
            resultado: votos_favor >= mayoria_requerida ? 'APROBADA' : 'RECHAZADA',
            votos_requeridos: mayoria_requerida,
            votos_favor,
            votos_contra,
            abstenciones
        };
    }

    return null;
};

// Verificar si hay quórum (corregido para la tabla real: sesion_id, presente)
const verificarQuorum = async (id_sesion) => {
    const pool = await conectar();
    const result = await pool.request()
        .input('id_sesion', sql.Int, id_sesion)
        .query(`
            SELECT
                COUNT(CASE WHEN asp.presente = 1 THEN 1 END) as presentes,
                s.quorum_requerido
            FROM sesiones s
            LEFT JOIN asistencia_sesion_plenaria asp ON s.sesion_id = asp.sesion_id
            WHERE s.sesion_id = @id_sesion
            GROUP BY s.quorum_requerido
        `);
    const datos = result.recordset[0];
    if (!datos) return { tiene_quorum: false, presentes: 0, requerido: 0 };
    return {
        tiene_quorum: datos.presentes >= datos.quorum_requerido,
        presentes: datos.presentes,
        requerido: datos.quorum_requerido
    };
};

module.exports = {
    registrarVotacion,
    obtenerVotacionesPorSesion,
    calcularResultado,
    verificarQuorum
};