import connection from '../db/dbConnect.js';

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

// GET /modelos → todos los modelos de maniquí (Mujer, Hombre, Niña, Niño)
const findAll = async () => {
  const sql = `
    SELECT 
      id_modelo       AS id,
      nombre_modelo,
      linea_producto
    FROM Modelo
    ORDER BY id_modelo
  `;
  return await query(sql);
};

export default { findAll };