const Votacion = require('../models/Votacion');

const registrarVotacion = async (req, res) => {
    try {
        const { id_sesion, id_propuesta, votos_favor, votos_contra, abstenciones, tipo_mayoria } = req.body;

        if (!id_sesion || !id_propuesta || votos_favor === undefined || votos_contra === undefined) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        // Verificar quórum antes de registrar
        const quorum = await Votacion.verificarQuorum(id_sesion);
        if (!quorum.tiene_quorum) {
            return res.status(400).json({
                error: `No hay quórum suficiente. Presentes: ${quorum.presentes}, Requeridos: ${quorum.requerido}`
            });
        }

        // Calcular resultado
        const resultado = Votacion.calcularResultado(
            votos_favor,
            votos_contra,
            abstenciones || 0,
            tipo_mayoria || 'SIMPLE'
        );

        await Votacion.registrarVotacion(
            id_sesion,
            id_propuesta,
            votos_favor,
            votos_contra,
            abstenciones || 0,
            tipo_mayoria || 'SIMPLE'
        );

        res.status(201).json({
            mensaje: 'Votación registrada correctamente',
            resultado
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar votación' });
    }
};

const obtenerVotaciones = async (req, res) => {
    try {
        const { id_sesion } = req.params;
        const votaciones = await Votacion.obtenerVotacionesPorSesion(id_sesion);
        res.json(votaciones);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener votaciones' });
    }
};

const calcularResultado = async (req, res) => {
    try {
        const { votos_favor, votos_contra, abstenciones, tipo_mayoria } = req.body;
        const resultado = Votacion.calcularResultado(
            votos_favor,
            votos_contra,
            abstenciones || 0,
            tipo_mayoria || 'SIMPLE'
        );
        res.json(resultado);
    } catch (err) {
        res.status(500).json({ error: 'Error al calcular resultado' });
    }
};

module.exports = {
    registrarVotacion,
    obtenerVotaciones,
    calcularResultado
};