const Sesion = require('../models/Sesion');
const Votacion = require('../models/Votacion');

const listarSesiones = async (req, res) => {
    try {
        const sesiones = await Sesion.listarSesiones();
        res.json(sesiones);
    } catch (err) {
        console.error('listarSesiones:', err);
        res.status(500).json({ error: 'Error al listar sesiones' });
    }
};

const obtenerSesion = async (req, res) => {
    try {
        const { id } = req.params;
        const sesion = await Sesion.obtenerSesionPorId(id);
        if (!sesion) return res.status(404).json({ error: 'Sesión no encontrada' });
        res.json(sesion);
    } catch (err) {
        console.error('obtenerSesion:', err);
        res.status(500).json({ error: 'Error al obtener sesión' });
    }
};

const crearSesion = async (req, res) => {
    try {
        const { numero_sesion, fecha, id_tipo_sesion, id_tipo_modalidad, quorum_requerido } = req.body;
        if (!numero_sesion || !fecha || !quorum_requerido) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        await Sesion.crearSesion(numero_sesion, fecha, id_tipo_sesion, id_tipo_modalidad, quorum_requerido);
        res.status(201).json({ mensaje: 'Sesión creada correctamente' });
    } catch (err) {
        console.error('crearSesion:', err);
        res.status(500).json({ error: 'Error al crear sesión' });
    }
};

const registrarAsistencia = async (req, res) => {
    try {
        const { id_sesion, id_asambleista, presente } = req.body;
        if (!id_sesion || !id_asambleista || presente === undefined) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        await Sesion.registrarAsistencia(id_sesion, id_asambleista, presente);
        res.status(201).json({ mensaje: 'Asistencia registrada correctamente' });
    } catch (err) {
        console.error('registrarAsistencia:', err);
        res.status(500).json({ error: 'Error al registrar asistencia' });
    }
};

const marcarAsistencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_asambleista, presente } = req.body;
        if (!id_asambleista || presente === undefined) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        await Sesion.marcarAsistencia(id, id_asambleista, presente);
        res.json({ mensaje: 'Asistencia actualizada correctamente' });
    } catch (err) {
        console.error('marcarAsistencia:', err);
        res.status(500).json({ error: 'Error al marcar asistencia' });
    }
};

const obtenerAsistencia = async (req, res) => {
    try {
        const { id } = req.params;
        const asistencia = await Sesion.obtenerAsistencia(id);
        res.json(asistencia);
    } catch (err) {
        console.error('obtenerAsistencia:', err);
        res.status(500).json({ error: 'Error al obtener asistencia' });
    }
};

const verificarQuorum = async (req, res) => {
    try {
        const { id } = req.params;
        const quorum = await Votacion.verificarQuorum(id);
        res.json(quorum);
    } catch (err) {
        console.error('verificarQuorum:', err);
        res.status(500).json({ error: 'Error al verificar quórum' });
    }
};

module.exports = {
    listarSesiones,
    obtenerSesion,
    crearSesion,
    registrarAsistencia,
    marcarAsistencia,
    obtenerAsistencia,
    verificarQuorum
};