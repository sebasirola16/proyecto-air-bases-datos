const crypto = require('crypto');

// Genera un hash SHA-256 a partir de los datos clave del certificado.
// Si cualquiera de estos datos cambia, el hash resultante cambia,
// lo que permite detectar si un certificado fue adulterado.
const generarHashCertificado = (folio, cedula, fechaEmision) => {
    const datos = `${folio}|${cedula}|${fechaEmision}`;
    return crypto.createHash('sha256').update(datos).digest('hex');
};

// Verifica que un hash recibido coincida con el recalculado a partir de los datos.
const verificarHash = (folio, cedula, fechaEmision, hashOriginal) => {
    const hashRecalculado = generarHashCertificado(folio, cedula, fechaEmision);
    return hashRecalculado === hashOriginal;
};

module.exports = { generarHashCertificado, verificarHash };