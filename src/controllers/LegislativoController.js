const Normativa = require('../models/Normativa');

const listarReglamentos = async (req, res) => {
    try {
        const reglamentos = await Normativa.obtenerListadoReglamentos();
        res.json(reglamentos);
    } catch (err) {
        console.error('listarReglamentos:', err);
        res.status(500).json({ error: err.message }); // ← cambia esto temporalmente
    }
};

const crearNuevoReglamento = async (req, res) => {
    try {
        const { nombre_normativa, sigla } = req.body;
        if (!nombre_normativa || !sigla) {
            return res.status(400).json({ error: 'Nombre y sigla son obligatorios' });
        }
        const nuevo = await Normativa.crearReglamento(nombre_normativa, sigla);
        res.status(201).json({ mensaje: 'Reglamento registrado correctamente', id: nuevo?.id_reglamento });
    } catch (err) {
        console.error('crearNuevoReglamento:', err);
        res.status(500).json({ error: 'Error al registrar reglamento' });
    }
};

const verArbol = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'ID de reglamento es obligatorio' });
        const arbol = await Normativa.obtenerElementosPorReglamento(id);
        res.json(arbol);
    } catch (err) {
        console.error('verArbol:', err);
        res.status(500).json({ error: 'Error al obtener árbol normativo' });
    }
};

const agregarElemento = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_elemento_padre, id_nivel_reglamento, numero_etiqueta, contenido_texto, orden, fecha_inicio_vigencia, id_estado_vigencia } = req.body;

        if (!id || !id_nivel_reglamento || !contenido_texto || !orden) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const nuevo = await Normativa.agregarElementoNormativo({
            id_reglamento: id,
            id_elemento_padre: id_elemento_padre || null,
            id_nivel_reglamento,
            numero_etiqueta,
            contenido_texto,
            orden,
            fecha_inicio_vigencia,
            id_estado_vigencia
        });

        res.status(201).json({ mensaje: 'Elemento normativo registrado correctamente', id: nuevo?.id_elemento });
    } catch (err) {
        console.error('agregarElemento:', err);
        res.status(500).json({ error: 'Error al registrar elemento normativo' });
    }
};

const publicarVersion = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_elemento_padre, id_nivel_reglamento, numero_etiqueta, contenido_texto, orden, id_estado_vigencia } = req.body;

        if (!id || !id_nivel_reglamento || !contenido_texto || !orden) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        const nuevo = await Normativa.publicarNuevaVersion({
            id_reglamento: id,
            id_elemento_padre: id_elemento_padre || null,
            id_nivel_reglamento,
            numero_etiqueta,
            contenido_texto,
            orden,
            id_estado_vigencia
        });

        res.status(201).json({ mensaje: 'Versión publicada correctamente', id: nuevo?.id_elemento });
    } catch (err) {
        console.error('publicarVersion:', err);
        res.status(500).json({ error: 'Error al publicar versión' });
    }
};

const listarNiveles = async (req, res) => {
    try {
        const niveles = await Normativa.obtenerNiveles();
        res.json(niveles);
    } catch (err) {
        console.error('listarNiveles:', err);
        res.status(500).json({ error: 'Error al listar niveles' });
    }
};

const listarEstados = async (req, res) => {
    try {
        const estados = await Normativa.obtenerEstadosVigencia();
        res.json(estados);
    } catch (err) {
        console.error('listarEstados:', err);
        res.status(500).json({ error: 'Error al listar estados' });
    }
};

module.exports = {
    listarReglamentos,
    crearNuevoReglamento,
    verArbol,
    agregarElemento,
    publicarVersion,
    listarNiveles,
    listarEstados
};