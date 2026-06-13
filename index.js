require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// --- DB ---
const { conectar } = require('./src/config/db');

// --- Controllers ---
const SecretariaController = require('./src/controllers/SecretariaController');
const LegislativoController = require('./src/controllers/LegislativoController');
const ComisionController = require('./src/controllers/ComisionesController');
const CertificadoController = require('./src/controllers/CertificadoController');
const PropuestaController = require('./src/controllers/PropuestaController');
const VotacionController = require('./src/controllers/VotacionController');
const SesionController = require('./src/controllers/SesionController');
const ReporteController = require('./src/controllers/ReporteController');
const BitacoraController = require('./src/controllers/BitacoraController');
const UsuarioController = require('./src/controllers/UsuarioController');

// --- Auth ---
const { login, requireAuth, requireRole } = require('./src/controllers/AuthController');

// ======== Health check ========
app.get('/health', async (req, res) => {
    await conectar();
    res.json({ ok: true });
});

// ======== LOGIN ========
app.post('/api/login', login);

// ======== API ASAMBLEISTAS ========
app.get('/api/asambleistas', SecretariaController.listarAsambleistas);
app.get('/api/asambleistas/:cedula', SecretariaController.obtenerPorCedula);
app.post('/api/asambleistas', SecretariaController.registrarAsambleista);
app.put('/api/asambleistas/:id', SecretariaController.editarAsambleista);
app.get('/api/asambleistas/:id/nombramientos', SecretariaController.listarNombramientos);
app.post('/api/nombramientos', SecretariaController.registrarNombramiento);
app.get('/api/sectores', SecretariaController.listarSectores);

// ======== API NORMATIVA ========
app.get('/api/reglamentos', LegislativoController.listarReglamentos);
app.get('/api/reglamentos/:id/arbol', LegislativoController.verArbol);
app.post('/api/reglamentos', requireAuth, requireRole('Secretaría'), LegislativoController.crearNuevoReglamento);
app.post('/api/reglamentos/:id/elementos', requireAuth, requireRole('Secretaría'), LegislativoController.agregarElemento);
app.post('/api/reglamentos/:id/version', requireAuth, requireRole('Secretaría'), LegislativoController.publicarVersion);
app.get('/api/normativa/niveles', LegislativoController.listarNiveles);
app.get('/api/normativa/estados', LegislativoController.listarEstados);

// ======== API COMISIONES ========
app.get('/api/comisiones', ComisionController.listarComisiones);

// ======== API CERTIFICACIONES ========
app.get('/api/certificaciones', CertificadoController.listarCertificaciones);
app.get('/api/certificaciones/historial/:id', CertificadoController.obtenerHistorial);
app.post('/api/certificaciones/emitir', CertificadoController.emitirCertificacion);

// ======== API PROPUESTAS ========
app.get('/api/propuestas', PropuestaController.listarPropuestas);
app.get('/api/propuestas/:id', PropuestaController.obtenerPropuesta);
app.post('/api/propuestas', PropuestaController.crearPropuesta);

// ======== API VOTACIONES ========
app.get('/api/votaciones/sesion/:id_sesion', VotacionController.obtenerVotaciones);
app.post('/api/votaciones', VotacionController.registrarVotacion);
app.post('/api/votaciones/calcular', VotacionController.calcularResultado);

// ======== API SESIONES ========
app.get('/api/sesiones', SesionController.listarSesiones);
app.get('/api/sesiones/:id', SesionController.obtenerSesion);
app.post('/api/sesiones', SesionController.crearSesion);
app.get('/api/sesiones/:id/asistencia', SesionController.obtenerAsistencia);
app.post('/api/sesiones/asistencia', SesionController.registrarAsistencia);
app.get('/api/sesiones/:id/quorum', SesionController.verificarQuorum);
app.put('/api/sesiones/:id/asistencia', SesionController.marcarAsistencia);

// ======== API REPORTES ========
app.get('/api/reportes/historial/:id_asambleista', ReporteController.obtenerHistorial);
app.post('/api/reportes/certificacion', ReporteController.generarCertificacion);
app.get('/api/reportes/certificaciones', ReporteController.listarCertificaciones);

// ======== API BITÁCORA ========
app.get('/api/admin/bitacora', BitacoraController.listarBitacora);

// ======== API USUARIOS ========
app.get('/api/admin/usuarios', UsuarioController.listarUsuarios);
app.get('/api/admin/roles', UsuarioController.listarRoles);
app.post('/api/admin/usuarios', UsuarioController.crearUsuario);

// ======== Servir vistas HTML ========
app.use(express.static(path.join(__dirname, 'src', 'views')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/shared/login.view.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor AIR corriendo en puerto ${PORT}`));