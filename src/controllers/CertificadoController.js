const Certificado = require('../models/Certificado');
const { generarHashCertificado } = require('../services/CryptoService');

// Listar todas las certificaciones emitidas
const listarCertificaciones = async (req, res) => {
    try {
        const certificaciones = await Certificado.listarCertificaciones();
        res.json(certificaciones);
    } catch (err) {
        console.error('listarCertificaciones:', err);
        res.status(500).json({ error: 'Error al listar certificaciones' });
    }
};

// Obtener el historial de un asambleísta (para previsualizar antes de emitir)
const obtenerHistorial = async (req, res) => {
    try {
        const { id } = req.params;
        const historial = await Certificado.obtenerHistorialAsambleista(id);
        res.json(historial);
    } catch (err) {
        console.error('obtenerHistorial:', err);
        res.status(500).json({ error: 'Error al obtener historial del asambleísta' });
    }
};

// Emitir una nueva certificación: genera folio, calcula hash y la registra
const emitirCertificacion = async (req, res) => {
    try {
        const { id_asambleista, cedula, usuario_secretaria } = req.body;

        if (!id_asambleista || !cedula) {
            return res.status(400).json({ error: 'Faltan datos obligatorios (id_asambleista, cedula)' });
        }

        // 1. Generar folio único DAIR-XXX-AAAA
        const folio = await Certificado.generarFolio();

        // 2. Calcular hash de integridad
        const fechaEmision = new Date().toISOString().split('T')[0];
        const hash = generarHashCertificado(folio, cedula, fechaEmision);

        // 3. Registrar en la base de datos
        await Certificado.registrarCertificacion(id_asambleista, folio, hash, usuario_secretaria || 'sistema');

        res.status(201).json({
            mensaje: 'Certificación emitida correctamente',
            folio,
            hash
        });
    } catch (err) {
        console.error('emitirCertificacion:', err);
        res.status(500).json({ error: 'Error al emitir certificación' });
    }
};

module.exports = {
    listarCertificaciones,
    obtenerHistorial,
    emitirCertificacion
};