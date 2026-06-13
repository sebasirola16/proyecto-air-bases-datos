const Bitacora = require('../models/Bitacora');

const listarBitacora = async (req, res) => {
    try {
        const { desde, hasta, accion } = req.query;
        const registros = await Bitacora.listarBitacora(desde, hasta, accion);
        res.json(registros);
    } catch (err) {
        console.error('listarBitacora:', err);
        res.status(500).json({ error: 'Error al listar la bitácora' });
    }
};

module.exports = { listarBitacora };