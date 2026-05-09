const sql = require('mssql');

const config = {
    user: process.env.DB_USER || 'admin_air',
    password: process.env.DB_PASSWORD || 'Proyecto02',
    server: process.env.DB_SERVER || 'server-air-proyecto2-sebasirola-danielhernandez-juanmedina.database.windows.net',
    database: process.env.DB_NAME || 'air_proyecto2',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

const conectar = async () => {
    try {
        await sql.connect(config);
        console.log('Conectado a la base de datos AIR');
    } catch (err) {
        console.error('Error de conexión:', err);
    }
};

module.exports = { sql, conectar };