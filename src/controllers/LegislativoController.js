const Normativa = require('../models/Normativa');

// Obtener todos los reglamentos
const listarReglamentos = async (req, res) => {
    try {
        const reglamentos = await Normativa.obtenerListadoReglamentos();
        res.json(reglamentos);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar reglamentos' });
    }
};

// Registrar nuevo reglamento
const registrarReglamento = async (req, res) => {
    try {
        const { nombre_normativa, sigla } = req.body;

        if (!nombre_normativa || !sigla) {
            return res.status(400).json({ error: 'Nombre y sigla son obligatorios' });
        }

        await Normativa.crearReglamento(nombre_normativa, sigla);
        res.status(201).json({ mensaje: 'Reglamento registrado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar reglamento' });
    }
};

// Obtener árbol normativo de un reglamento
const visualizarArbolNormativo = async (req, res) => {
    try {
        const { id_reglamento } = req.params;

        if (!id_reglamento) {
            return res.status(400).json({ error: 'ID de reglamento es obligatorio' });
        }

        const elementos = await Normativa.obtenerElementosPorReglamento(id_reglamento);
        res.json(elementos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener árbol normativo' });
    }
};

// Registrar elemento normativo (Título, Capítulo, Artículo, Inciso)
const registrarElementoNormativo = async (req, res) => {
    try {
        const { id_reglamento, id_elemento_padre, id_nivel_reglamento, numero_etiqueta, contenido_texto, orden } = req.body;

        if (!id_reglamento || !id_nivel_reglamento || !contenido_texto || !orden) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        // Validar jerarquía: si tiene padre, el nivel debe ser mayor
        if (id_elemento_padre && id_nivel_reglamento <= 1) {
            return res.status(400).json({ error: 'El nivel jerárquico no es válido para este elemento padre' });
        }

        await Normativa.agregarElementoNormativo(
            id_reglamento,
            id_elemento_padre || null,
            id_nivel_reglamento,
            numero_etiqueta,
            contenido_texto,
            orden
        );

        res.status(201).json({ mensaje: 'Elemento normativo registrado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar elemento normativo' });
    }
};

module.exports = {
    listarReglamentos,
    registrarReglamento,
    visualizarArbolNormativo,
    registrarElementoNormativo
};