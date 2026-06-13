const Propuesta = require('../models/Propuesta');

const listarPropuestas = async (req, res) => {
    try {
        const propuestas = await Propuesta.listarPropuestas();
        res.json(propuestas);
    } catch (err) {
        console.error('listarPropuestas:', err);
        res.status(500).json({ error: 'Error al listar propuestas' });
    }
};

const obtenerPropuesta = async (req, res) => {
    try {
        const { id } = req.params;
        const propuesta = await Propuesta.obtenerPropuestaPorId(id);
        if (!propuesta) {
            return res.status(404).json({ error: 'Propuesta no encontrada' });
        }
        res.json(propuesta);
    } catch (err) {
        console.error('obtenerPropuesta:', err);
        res.status(500).json({ error: 'Error al obtener propuesta' });
    }
};

const crearPropuesta = async (req, res) => {
    try {
        const { titulo, id_etapa_propuesta, id_estado_propuesta, texto_sustitutivo, codigo_air } = req.body;
        if (!titulo) {
            return res.status(400).json({ error: 'El título es obligatorio' });
        }
        await Propuesta.crearPropuesta(titulo, id_etapa_propuesta, id_estado_propuesta, texto_sustitutivo, codigo_air);
        res.status(201).json({ mensaje: 'Propuesta creada correctamente' });
    } catch (err) {
        console.error('crearPropuesta:', err);
        res.status(500).json({ error: 'Error al crear propuesta' });
    }
};

module.exports = {
    listarPropuestas,
    obtenerPropuesta,
    crearPropuesta
};