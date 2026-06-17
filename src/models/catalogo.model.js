import connection from '../db/dbConnect.js';

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

// GET /catalogo → todas las combinaciones de modelo + categoría
// Arma la descripción tipo "Cabeza de Mujer" con un JOIN
const findAll = async () => {
  const sql = `
    SELECT 
      Cat.id_catalogo                                       AS id,
      Cat.id_modelo,
      Cat.id_categoria,
      Mo.nombre_modelo,
      C.nombre_categoria,
      CONCAT(C.nombre_categoria, ' de ', Mo.nombre_modelo)  AS descripcion
    FROM Catalogo_Pieza Cat
    JOIN Modelo Mo          ON Cat.id_modelo = Mo.id_modelo
    JOIN Categoria_Pieza C  ON Cat.id_categoria = C.id_categoria
    ORDER BY Cat.id_catalogo
  `;
  return await query(sql);
};

export default { findAll };