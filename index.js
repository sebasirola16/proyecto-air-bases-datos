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
app.get('/api/reglamentos/:id/arbol', LegislativoController.visualizarArbolNormativo);
app.post('/api/reglamentos', requireAuth, requireRole('Secretaría'), LegislativoController.registrarReglamento);
app.post('/api/reglamentos/:id/elementos', requireAuth, requireRole('Secretaría'), LegislativoController.registrarElementoNormativo);

// ======== Servir vistas HTML ========
app.use(express.static(path.join(__dirname, 'src', 'views')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/shared/login.view.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor AIR corriendo en puerto ${PORT}`));