const { Client } = require('pg');
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

client.connect()
    .then(() => console.log("Conexión exitosa a la base de datos"))
    .catch(err => console.error('Error de conexión', err));

module.exports = client;
