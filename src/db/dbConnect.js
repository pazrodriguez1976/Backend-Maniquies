const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root',               
  database: 'fabrica_maniquies'   
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err.message);
    return;
  }
  console.log('Conexión a MySQL establecida correctamente');
});

module.exports = connection;