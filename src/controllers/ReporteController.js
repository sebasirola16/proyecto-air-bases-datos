const Certificado = require('../models/Certificado');
const crypto = require('crypto');

const obtenerHistorial = async (req, res) => {
    try {
        const { id_asambleista } = req.params;
        const historial = await Certificado.obtenerHistorialAsambleista(id_asambleista);
        if (!historial.datos.length) {
            return res.status(404).json({ error: 'Asambleísta no encontrado' });
        }
        res.json(historial);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
};

const generarCertificacion = async (req, res) => {
    try {
        const { id_asambleista, usuario_secretaria } = req.body;

        if (!id_asambleista || !usuario_secretaria) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        // Obtener historial
        const historial = await Certificado.obtenerHistorialAsambleista(id_asambleista);
        if (!historial.datos.length) {
            return res.status(404).json({ error: 'Asambleísta no encontrado' });
        }

        // Generar folio único
        const folio = await Certificado.generarFolio();

        // Generar hash SHA-256 del contenido
        const contenido = JSON.stringify({ historial, folio, fecha: new Date().toISOString() });
        const hash = crypto.createHash('sha256').update(contenido).digest('hex');

        // Registrar certificación
        await Certificado.registrarCertificacion(id_asambleista, folio, hash, usuario_secretaria);

        res.json({
            mensaje: 'Certificación generada correctamente',
            folio,
            hash,
            historial
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al generar certificación' });
    }
};

const listarCertificaciones = async (req, res) => {
    try {
        const certificaciones = await Certificado.listarCertificaciones();
        res.json(certificaciones);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar certificaciones' });
    }
};

module.exports = {
    obtenerHistorial,
    generarCertificacion,
    listarCertificaciones
};