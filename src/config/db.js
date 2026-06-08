const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
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
      console.log('Conectado a la base de datos AIR');
    }
    return pool;
  } catch (err) {
    console.error('Error de conexión:', err);
    throw err;
  }
};

// Setear contexto de auditoría (para triggers sys_log_auditoria)
const setDbUserContext = async (idUsuario) => {
  if (!pool) await conectar();
  await pool.request()
    .input('id', sql.Int, idUsuario)
    .query("EXEC sys.sp_set_session_context @key=N'id_usuario', @value=@id;");
};

module.exports = { sql, conectar, setDbUserContext };
