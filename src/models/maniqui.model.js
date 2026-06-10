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
// GET /maniquies → todos los maniquíes
// Adaptamos los nombres de columnas de la BD a los que usa el front
// ─────────────────────────────────────────────────────────────────
const findAll = async () => {
  const sql = `
    SELECT 
      M.id_maniqui                      AS id,
      M.id_modelo,
      Mo.nombre_modelo,
      M.material_requerido              AS material,
      M.color_requerido                 AS color,
      M.fecha_ensamblaje,
      M.estado_ensamblaje               AS estado
    FROM Maniqui M
    JOIN Modelo Mo ON M.id_modelo = Mo.id_modelo
  `;
  return await query(sql);
};

// ─────────────────────────────────────────────────────────────────
// GET /maniquies/:id → maniquí con sus piezas asignadas
// ─────────────────────────────────────────────────────────────────
const findById = async (id) => {
  // Primero traemos el maniqui
  const sqlManiqui = `
    SELECT 
      M.id_maniqui                      AS id,
      M.id_modelo,
      Mo.nombre_modelo,
      M.material_requerido              AS material,
      M.color_requerido                 AS color,
      M.fecha_ensamblaje,
      M.estado_ensamblaje               AS estado
    FROM Maniqui M
    JOIN Modelo Mo ON M.id_modelo = Mo.id_modelo
    WHERE M.id_maniqui = ?
  `;
  const maniquies = await query(sqlManiqui, [id]);
  const maniqui = maniquies[0];
  if (!maniqui) return null;

  // Luego traemos las piezas asignadas a ese maniqui
  const sqlPiezas = `
    SELECT 
      P.id_pieza       AS id,
      P.id_catalogo,
      P.material,
      P.color,
      P.estado_calidad,
      P.id_maniqui,
      CONCAT(C.nombre_categoria, ' de ', Mo.nombre_modelo) AS descripcion
    FROM Pieza P
    JOIN Catalogo_Pieza Cat ON P.id_catalogo = Cat.id_catalogo
    JOIN Categoria_Pieza C  ON Cat.id_categoria = C.id_categoria
    JOIN Modelo Mo          ON Cat.id_modelo = Mo.id_modelo
    WHERE P.id_maniqui = ?
  `;
  const piezas = await query(sqlPiezas, [id]);

  return { ...maniqui, piezas };
};

// ─────────────────────────────────────────────────────────────────
// POST /maniquies → crear nueva orden de ensamblaje
// ─────────────────────────────────────────────────────────────────
const create = async ({ id_modelo, material, color }) => {
  const maxResult = await query('SELECT MAX(id_maniqui) AS maxId FROM Maniqui');
  const nextId = (maxResult[0].maxId || 0) + 1;
  console.log('Nuevo ID calculado:', nextId);

  const sql = `
    INSERT INTO Maniqui (id_maniqui, id_modelo, material_requerido, color_requerido, fecha_ensamblaje, estado_ensamblaje)
    VALUES (?, ?, ?, ?, NULL, 'Pendiente')
  `;
  await query(sql, [nextId, id_modelo, material, color]);
  console.log('INSERT ejecutado, buscando ID:', nextId);

  const resultado = await findById(nextId);
  console.log('Resultado findById:', resultado);
  return resultado;
};

// ─────────────────────────────────────────────────────────────────
// PUT /maniquies/:id → editar material y color
// ─────────────────────────────────────────────────────────────────
const update = async (id, { material, color }) => {
  const sql = `
    UPDATE Maniqui 
    SET material_requerido = ?, color_requerido = ?
    WHERE id_maniqui = ?
  `;
  await query(sql, [material, color, id]);
  return await findById(id);
};

// ─────────────────────────────────────────────────────────────────
// DELETE /maniquies/:id → eliminar maniqui (libera sus piezas antes)
// ─────────────────────────────────────────────────────────────────
const remove = async (id) => {
  // Primero liberamos todas las piezas asignadas
  await query(`UPDATE Pieza SET id_maniqui = NULL WHERE id_maniqui = ?`, [id]);
  // Luego eliminamos el maniqui
  await query(`DELETE FROM Maniqui WHERE id_maniqui = ?`, [id]);
};

// ─────────────────────────────────────────────────────────────────
// PATCH /maniquies/:id/estado → cambiar estado_ensamblaje
// ─────────────────────────────────────────────────────────────────
const updateEstado = async (id, estado) => {
  await query(`UPDATE Maniqui SET estado_ensamblaje = ? WHERE id_maniqui = ?`, [estado, id]);
  return await findById(id);
};

// ─────────────────────────────────────────────────────────────────
// PATCH /maniquies/:id/asignar-pieza
// Valida que la pieza esté libre y que no haya otra de la misma categoría
// ─────────────────────────────────────────────────────────────────
const asignarPieza = async (id_maniqui, id_pieza) => {
  //Verifica que la pieza existe y esta libre
  const piezaLibre = await query(
    `SELECT * FROM Pieza WHERE id_pieza = ? AND id_maniqui IS NULL`,
    [id_pieza]
  );
  if (!piezaLibre[0]) return { error: 'Pieza no disponible o ya asignada' };

  //Obtener la categoria de la pieza nueva
  const catNueva = await query(`
    SELECT Cat.id_categoria 
    FROM Pieza P
    JOIN Catalogo_Pieza Cat ON P.id_catalogo = Cat.id_catalogo
    WHERE P.id_pieza = ?
  `, [id_pieza]);
  const id_categoria_nueva = catNueva[0]?.id_categoria;

  //Verifica si el maniqui ya tiene una pieza de esa categoria
  const yaAsignada = await query(`
    SELECT P.id_pieza 
    FROM Pieza P
    JOIN Catalogo_Pieza Cat ON P.id_catalogo = Cat.id_catalogo
    WHERE P.id_maniqui = ? AND Cat.id_categoria = ?
  `, [id_maniqui, id_categoria_nueva]);

  if (yaAsignada.length > 0) {
    return { error: 'El maniquí ya tiene una pieza de esa categoría asignada' };
  }

  //Asigna la pieza
  await query(`UPDATE Pieza SET id_maniqui = ? WHERE id_pieza = ?`, [id_maniqui, id_pieza]);
  const piezaActualizada = await query(`SELECT * FROM Pieza WHERE id_pieza = ?`, [id_pieza]);
  return { pieza: piezaActualizada[0] };
};

// ─────────────────────────────────────────────────────────────────
// PATCH /maniquies/:id/liberar-pieza → desasignar pieza del maniquí
// ─────────────────────────────────────────────────────────────────
const liberarPieza = async (id_maniqui, id_pieza) => {
  const pieza = await query(
    `SELECT * FROM Pieza WHERE id_pieza = ? AND id_maniqui = ?`,
    [id_pieza, id_maniqui]
  );
  if (!pieza[0]) return { error: 'La pieza no está asignada a este maniquí' };

  await query(`UPDATE Pieza SET id_maniqui = NULL WHERE id_pieza = ?`, [id_pieza]);
  const piezaActualizada = await query(`SELECT * FROM Pieza WHERE id_pieza = ?`, [id_pieza]);
  return { pieza: piezaActualizada[0] };
};

module.exports = { findAll, findById, create, update, remove, updateEstado, asignarPieza, liberarPieza };