const Asambleista = require('../models/Asambleista');
const Nombramiento = require('../models/Nombramiento');

// Listar todos los asambleistas
const listarAsambleistas = async (req, res) => {
    try {
        const asambleistas = await Asambleista.listarAsambleistas();
        res.json(asambleistas);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar asambleistas' });
    }
};

// Obtener asambleista por cedula
const obtenerPorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const asambleista = await Asambleista.obtenerPorCedula(cedula);
        if (!asambleista) {
            return res.status(404).json({ error: 'Asambleista no encontrado' });
        }
        res.json(asambleista);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener asambleista' });
    }
};

// Registrar asambleista
const registrarAsambleista = async (req, res) => {
    try {
        const { cedula, nombre, correo } = req.body;

        // Validar cedula
        if (!cedula || !nombre) {
            return res.status(400).json({ error: 'Cedula y nombre son obligatorios' });
        }

        // Verificar si ya existe
        const existe = await Asambleista.obtenerPorCedula(cedula);
        if (existe) {
            return res.status(400).json({ error: 'Ya existe un asambleista con esa cedula' });
        }

        await Asambleista.crearAsambleista(cedula, nombre, correo);
        res.status(201).json({ mensaje: 'Asambleista registrado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar asambleista' });
    }
};

// Editar asambleista
const editarAsambleista = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo } = req.body;
        await Asambleista.editarAsambleista(id, nombre, correo);
        res.json({ mensaje: 'Asambleista actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al editar asambleista' });
    }
};

// Listar nombramientos de un asambleista
const listarNombramientos = async (req, res) => {
    try {
        const { id } = req.params;
        const nombramientos = await Nombramiento.listarNombramientos(id);
        res.json(nombramientos);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar nombramientos' });
    }
};

// Registrar nombramiento
const registrarNombramiento = async (req, res) => {
    try {
        const { asambleista_id, sector_id, id_puesto, fecha_inicio } = req.body;

        if (!asambleista_id || !sector_id || !fecha_inicio) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        await Nombramiento.crearNombramiento(asambleista_id, sector_id, id_puesto, fecha_inicio);
        res.status(201).json({ mensaje: 'Nombramiento registrado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar nombramiento' });
    }
};

// Listar sectores
const listarSectores = async (req, res) => {
    try {
        const sectores = await Nombramiento.listarSectores();
        res.json(sectores);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar sectores' });
    }
};

module.exports = {
    listarAsambleistas,
    obtenerPorCedula,
    registrarAsambleista,
    editarAsambleista,
    listarNombramientos,
    registrarNombramiento,
    listarSectores
};