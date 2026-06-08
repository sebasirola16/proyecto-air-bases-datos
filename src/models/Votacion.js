const { sql, conectar } = require('../config/db');

// Registrar resultado de votación
const registrarVotacion = async (id_sesion, id_propuesta, votos_favor, votos_contra, abstenciones, tipo_mayoria) => {
    await conectar();
    await sql.query`
        INSERT INTO votaciones_acuerdos 
            (id_sesion, id_propuesta, votos_favor, votos_contra, abstenciones, tipo_mayoria)
        VALUES 
            (${id_sesion}, ${id_propuesta}, ${votos_favor}, ${votos_contra}, ${abstenciones}, ${tipo_mayoria})
    `;
};

// Obtener votaciones de una sesión
const obtenerVotacionesPorSesion = async (id_sesion) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            v.id_votacion,
            v.votos_favor,
            v.votos_contra,
            v.abstenciones,
            v.tipo_mayoria,
            p.titulo as propuesta
        FROM votaciones_acuerdos v
        JOIN propuesta p ON v.id_propuesta = p.id_propuesta
        WHERE v.id_sesion = ${id_sesion}
    `;
    return result.recordset;
};

// Calcular resultado de votación
const calcularResultado = (votos_favor, votos_contra, abstenciones, tipo_mayoria) => {
    const total_votos = votos_favor + votos_contra + abstenciones;

    if (tipo_mayoria === 'SIMPLE') {
        // Mayoría simple: más de la mitad de votos emitidos
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
        // Mayoría calificada: 66% de los votos emitidos
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

// Verificar si hay quórum
const verificarQuorum = async (id_sesion) => {
    await conectar();
    const result = await sql.query`
        SELECT 
            COUNT(CASE WHEN asp.id_estado_asistencia = 1 THEN 1 END) as presentes,
            s.quorum_requerido
        FROM sesiones s
        LEFT JOIN asistencia_sesion_plenaria asp ON s.id_sesion = asp.id_sesion
        WHERE s.id_sesion = ${id_sesion}
        GROUP BY s.quorum_requerido
    `;
    const datos = result.recordset[0];
    if (!datos) return { tiene_quorum: false };
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