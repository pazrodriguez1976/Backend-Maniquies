const connection = require('../db/dbConnect');

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

// ─────────────────────────────────────────────────────────────────
// GET /piezas → todas las piezas con descripción del catálogo
// Usa JOIN para armar la descripción: "Cabeza de Mujer"
// ─────────────────────────────────────────────────────────────────
const findAll = async (filtros = {}) => {
  let sql = `
    SELECT 
      P.id_pieza       AS id,
      P.id_catalogo,
      P.material,
      P.color,
      P.estado_calidad,
      P.id_maniqui,
      CONCAT(C.nombre_categoria, ' de ', M.nombre_modelo) AS descripcion
    FROM Pieza P
    JOIN Catalogo_Pieza Cat ON P.id_catalogo = Cat.id_catalogo
    JOIN Categoria_Pieza C  ON Cat.id_categoria = C.id_categoria
    JOIN Modelo M           ON Cat.id_modelo = M.id_modelo
    WHERE 1=1
  `;
  const params = [];

  if (filtros.material) {
    sql += ' AND P.material = ?';
    params.push(filtros.material);
  }
  if (filtros.color) {
    sql += ' AND P.color = ?';
    params.push(filtros.color);
  }

  return await query(sql, params);
};

// ─────────────────────────────────────────────────────────────────
// GET /piezas/stock → solo las piezas libres en el depósito
// ─────────────────────────────────────────────────────────────────
const findStock = async () => {
  const sql = `
    SELECT 
      P.id_pieza       AS id,
      P.id_catalogo,
      P.material,
      P.color,
      P.estado_calidad,
      P.id_maniqui,
      CONCAT(C.nombre_categoria, ' de ', M.nombre_modelo) AS descripcion
    FROM Pieza P
    JOIN Catalogo_Pieza Cat ON P.id_catalogo = Cat.id_catalogo
    JOIN Categoria_Pieza C  ON Cat.id_categoria = C.id_categoria
    JOIN Modelo M           ON Cat.id_modelo = M.id_modelo
    WHERE P.id_maniqui IS NULL
  `;
  return await query(sql);
};

// ─────────────────────────────────────────────────────────────────
// GET /piezas/:id → una pieza por ID
// ─────────────────────────────────────────────────────────────────
const findById = async (id) => {
  const sql = `
    SELECT 
      P.id_pieza       AS id,
      P.id_catalogo,
      P.material,
      P.color,
      P.estado_calidad,
      P.id_maniqui,
      CONCAT(C.nombre_categoria, ' de ', M.nombre_modelo) AS descripcion
    FROM Pieza P
    JOIN Catalogo_Pieza Cat ON P.id_catalogo = Cat.id_catalogo
    JOIN Categoria_Pieza C  ON Cat.id_categoria = C.id_categoria
    JOIN Modelo M           ON Cat.id_modelo = M.id_modelo
    WHERE P.id_pieza = ?
  `;
  const results = await query(sql, [id]);
  return results[0] || null;
};

// ─────────────────────────────────────────────────────────────────
// POST /piezas → agregar nueva pieza al inventario
// ─────────────────────────────────────────────────────────────────
const create = async ({ id_catalogo, material, color, estado_calidad = 'Disponible' }) => {
  const maxResult = await query('SELECT MAX(id_pieza) AS maxId FROM Pieza');
  const nextId = (maxResult[0].maxId || 0) + 1;

  const sql = `
    INSERT INTO Pieza (id_pieza, id_catalogo, material, color, estado_calidad, id_maniqui)
    VALUES (?, ?, ?, ?, ?, NULL)
  `;
  await query(sql, [nextId, id_catalogo, material, color, estado_calidad]);
  return await findById(nextId);
};
// ─────────────────────────────────────────────────────────────────
// PUT /piezas/:id → editar material y color de una pieza
// ─────────────────────────────────────────────────────────────────
const update = async (id, { material, color }) => {
  const sql = `UPDATE Pieza SET material = ?, color = ? WHERE id_pieza = ?`;
  await query(sql, [material, color, id]);
  return await findById(id);
};

// ─────────────────────────────────────────────────────────────────
// DELETE /piezas/:id → eliminar pieza (solo si está libre)
// ─────────────────────────────────────────────────────────────────
const remove = async (id) => {
  await query(`DELETE FROM Pieza WHERE id_pieza = ?`, [id]);
};

// ─────────────────────────────────────────────────────────────────
// Verificar si una pieza existe y está libre (para asignar)
// ─────────────────────────────────────────────────────────────────
const findLibreById = async (id) => {
  const sql = `SELECT * FROM Pieza WHERE id_pieza = ? AND id_maniqui IS NULL`;
  const results = await query(sql, [id]);
  return results[0] || null;
};

// Obtener el id_categoria de una pieza (para validar duplicados)
const getCategoriaDepieza = async (id_pieza) => {
  const sql = `
    SELECT Cat.id_categoria
    FROM Pieza P
    JOIN Catalogo_Pieza Cat ON P.id_catalogo = Cat.id_catalogo
    WHERE P.id_pieza = ?
  `;
  const results = await query(sql, [id_pieza]);
  return results[0] ? results[0].id_categoria : null;
};

module.exports = { findAll, findStock, findById, create, update, remove, findLibreById, getCategoriaDepieza };