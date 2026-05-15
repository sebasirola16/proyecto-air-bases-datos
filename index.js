require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// --- DB ---
const { conectar } = require('./src/config/db');

// --- Controllers existentes ---
const SecretariaController = require('./src/controllers/SecretariaController');

// --- Auth (A2) ---
const { login, requireAuth, requireRole } = require('./src/controllers/AuthController');

// ======== Health check ========
app.get('/health', async (req, res) => {
  await conectar();
  res.json({ ok: true });
});

// ======== LOGIN ========
app.post('/api/login', login);

// ======== API ASAMBLEISTAS (ya lo usan tus views) ========
app.get('/api/asambleistas', SecretariaController.listarAsambleistas);
app.get('/api/asambleistas/:cedula', SecretariaController.obtenerPorCedula);
app.post('/api/asambleistas', SecretariaController.registrarAsambleista);
app.put('/api/asambleistas/:id', SecretariaController.editarAsambleista);

app.get('/api/asambleistas/:id/nombramientos', SecretariaController.listarNombramientos);
app.post('/api/nombramientos', SecretariaController.registrarNombramiento);

app.get('/api/sectores', SecretariaController.listarSectores);

// ======== API NORMATIVA (placeholder para Persona B) ========
// Nota: Persona B va a crear LegislativoController.js real.
// Aquí dejamos la protección RBAC lista desde ya:
// - Secretaría: puede insertar/editar
// - Asambleísta: solo lectura
// (Rúbrica RBAC Semana 2) [1](https://estudianteccr-my.sharepoint.com/personal/s_irola_1_estudiantec_cr/_layouts/15/Doc.aspx?sourcedoc=%7B75504972-80B9-4486-8B18-4664454F8A61%7D&file=Divisi%C3%B3n.docx&action=default&mobileredirect=true)

// Ejemplo de endpoints futuros (se habilitan cuando Persona B tenga el controller):
// const LegislativoController = require('./src/controllers/LegislativoController');
// app.get('/api/normativa/arbol/:id_reglamento', requireAuth, LegislativoController.obtenerArbol);
// app.post('/api/normativa/elemento', requireAuth, requireRole('Secretaría'), LegislativoController.crearElemento);
// app.post('/api/normativa/publicar', requireAuth, requireRole('Secretaría'), LegislativoController.publicarVersion);

// ======== Servir vistas HTML como estáticos (para demo rápida) ========
// Ajustá la carpeta si tu ruta real es diferente.
// En tu repo, las vistas aparecen bajo "Views/Asambleistas..." etc. [1](https://estudianteccr-my.sharepoint.com/personal/s_irola_1_estudiantec_cr/_layouts/15/Doc.aspx?sourcedoc=%7B75504972-80B9-4486-8B18-4664454F8A61%7D&file=Divisi%C3%B3n.docx&action=default&mobileredirect=true)
app.use(express.static(path.join(__dirname, 'src', 'views')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor AIR corriendo en puerto ${PORT}`));