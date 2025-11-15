const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
// Render proporciona el puerto a través de la variable de entorno PORT
const port = process.env.PORT || 3000;

// Habilitar CORS para permitir que el frontend se comunique con este backend
app.use(cors());

// Servir archivos estáticos desde la carpeta 'public'
// Esto automáticamente servirá index.html en la ruta raíz '/'
app.use(express.static('public'));

// Configuración de la base de datos
// Usamos variables de entorno para la seguridad en producción (Render)
// y valores por defecto para el desarrollo local.
const dbConfig = {
    user: process.env.DB_USER || 'usr_DesaWebDevUMG',
    password: process.env.DB_PASSWORD || '!ngGuast@360',
    server: process.env.DB_SERVER || 'svr-sql-ctezo.southcentralus.cloudapp.azure.com',
    database: process.env.DB_DATABASE || 'db_DesaWebDevUMG',
    options: {
        encrypt: true, // Requerido para conexiones a Azure SQL
        trustServerCertificate: true // Cambiar a false en producción si tienes un certificado válido
    }
};

// Endpoint para obtener los mensajes
app.get('/messages', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        // Corregido: Usar la columna 'Fecha_Envio' para ordenar los mensajes.
        const result = await sql.query`SELECT Login_Emisor, Contenido FROM dbo.Chat_Mensaje ORDER BY Fecha_Envio ASC`;
        res.json(result.recordset);
    } catch (err) {
        console.error('Error en la conexión o consulta a la base de datos:', err);
        res.status(500).send('Error al conectar con la base de datos');
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
