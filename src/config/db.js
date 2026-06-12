const sql = require('mssql');

const config = {
  user: 'admin_air',
  password: 'Proyecto02',
  server: 'server-air-proyecto-sebastianirola-danielhernandez-juanmedina.database.windows.net',
  database: 'air_proyecto2',
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
      pool = await new sql.ConnectionPool(config).connect();
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
