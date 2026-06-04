const Comisiones = require('../models/Comisiones');

const listarComisiones = async (req, res) => {
    try {
        const comisiones = await Comisiones.listarComisiones();
        res.json(comisiones);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar comisiones' });
    }
};

const crearComision = async (req, res) => {
    try {
        const { nombre_comision, id_tipo_comision } = req.body;
        if (!nombre_comision) {
            return res.status(400).json({ error: 'El nombre de la comisión es obligatorio' });
        }
        await Comisiones.crearComision(nombre_comision, id_tipo_comision);
        res.status(201).json({ mensaje: 'Comisión creada correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear comisión' });
    }
};

const obtenerIntegrantes = async (req, res) => {
    try {
        const { id } = req.params;
        const integrantes = await Comisiones.obtenerIntegrantes(id);
        res.json(integrantes);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener integrantes' });
    }
};

const agregarIntegrante = async (req, res) => {
    try {
        const { id_comision, id_asambleista, id_rol_comision, fecha_ingreso } = req.body;
        if (!id_comision || !id_asambleista || !fecha_ingreso) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }
        await Comisiones.agregarIntegrante(id_comision, id_asambleista, id_rol_comision, fecha_ingreso);
        res.status(201).json({ mensaje: 'Integrante agregado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al agregar integrante' });
    }
};

const calcularAsistencia = async (req, res) => {
    try {
        const { id_asambleista, id_comision } = req.params;
        const porcentaje = await Comisiones.calcularAsistenciaComision(id_asambleista, id_comision);
        res.json({ porcentaje });
    } catch (err) {
        res.status(500).json({ error: 'Error al calcular asistencia' });
    }
};

module.exports = {
    listarComisiones,
    crearComision,
    obtenerIntegrantes,
    agregarIntegrante,
    calcularAsistencia
};