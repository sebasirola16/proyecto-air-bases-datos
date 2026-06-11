const sql = require('mssql');

const config = {
  user: 'admin_air@server-air-proyecto-sebastianirola-danielhernandez-juanmedina', // ✅ tu usuario de Azure
  password: 'Proyecto02', // ✅ tu contraseña real
  server: 'server-air-proyecto-sebastianirola-danielhernandez-juanmedina.database.windows.net', // ✅ tu server real
  database: 'air_proyecto_final', // ✅ nombre de tu BD
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// Pool reutilizable
let pool = null;

const conectar = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('✅ Conectado a la base de datos AIR');
    }
    return pool;
  } catch (err) {
    console.error('❌ Error de conexión:', err);
    throw err;
  }
};

// Contexto para triggers
const setDbUserContext = async (idUsuario) => {
  if (!pool) await conectar();
  await pool.request()
    .input('id', sql.Int, idUsuario)
    .query("EXEC sys.sp_set_session_context @key=N'id_usuario', @value=@id;");
};

module.exports = { sql, conectar, setDbUserContext };
