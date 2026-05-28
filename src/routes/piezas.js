const express = require("express");
const router = express.Router();
const { piezas, catalogo_piezas } = require("../data/db");

// GET /piezas → todas las piezas
router.get("/", (req, res) => {
  const { material, color } = req.query;
  
  // 1. Agrego la descripción a cada pieza cruzando los datos con el catálogo
  let resultado = piezas.map((pieza) => {
    const infoCatalogo = catalogo_piezas.find(c => c.id === pieza.id_catalogo);
    return {
      ...pieza,
      descripcion: infoCatalogo ? infoCatalogo.descripcion : "Pieza desconocida"
    };
  });

  // 2. Aplico los filtros si el frontend los manda
  if (material) resultado = resultado.filter(p => p.material.toLowerCase() === material.toLowerCase());
  if (color) resultado = resultado.filter(p => p.color.toLowerCase() === color.toLowerCase());

  res.json(resultado);
});

// GET /piezas/stock → solo las piezas libres
router.get("/stock", (req, res) => {
  const enStock = piezas.filter((p) => p.id_maniqui === null);
  
  // Agrego la descripción buscando el id_catalogo en catalogo_piezas
  const stockConNombres = enStock.map((pieza) => {
    const infoCatalogo = catalogo_piezas.find(c => c.id === pieza.id_catalogo);
    return {
      ...pieza,
      descripcion: infoCatalogo ? infoCatalogo.descripcion : "Pieza desconocida"
    };
  });

  res.json(stockConNombres);
});

// GET /piezas/:id → una pieza por ID
router.get("/:id", (req, res) => {
  const pieza = piezas.find((p) => p.id === parseInt(req.params.id));
  if (!pieza) return res.status(404).json({ error: "Pieza no encontrada" });
  res.json(pieza);
});

// POST /piezas → agregar pieza al inventario
router.post("/", (req, res) => {
  const { id_catalogo, material, color } = req.body;
  if (!id_catalogo || !material || !color) {
    return res.status(400).json({ error: "Faltan campos: id_catalogo, material, color" });
  }
  const nuevaPieza = {
    id: piezas.length + 1,
    id_catalogo,
    material,
    color,
    id_maniqui: null,
  };
  piezas.push(nuevaPieza);
  res.status(201).json(nuevaPieza);
});

// PUT /piezas/:id → editar una pieza
router.put("/:id", (req, res) => {
  const pieza = piezas.find((p) => p.id === parseInt(req.params.id));
  if (!pieza) return res.status(404).json({ error: "Pieza no encontrada" });

  const { material, color } = req.body;
  if (!material || !color) {
    return res.status(400).json({ error: "Faltan campos: material, color" });
  }

  pieza.material = material;
  pieza.color = color;

  res.json({ mensaje: "Pieza actualizada correctamente", pieza });
});

// DELETE /piezas/:id → eliminar una pieza
router.delete("/:id", (req, res) => {
  const index = piezas.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Pieza no encontrada" });

  if (piezas[index].id_maniqui !== null) {
    return res.status(400).json({ error: "No se puede eliminar una pieza asignada a un maniquí" });
  }

  const eliminada = piezas.splice(index, 1);
  res.json({ mensaje: "Pieza eliminada correctamente", pieza: eliminada[0] });
});

module.exports = router;