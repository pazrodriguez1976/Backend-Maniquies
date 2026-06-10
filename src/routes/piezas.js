const express = require("express");
const router = express.Router();
const piezaModel = require('../models/pieza.model');

// GET /piezas → todas las piezas (con filtros opcionales por query params)
router.get("/", async (req, res) => {
  try {
    const { material, color } = req.query;
    const piezas = await piezaModel.findAll({ material, color });
    res.json(piezas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /piezas/stock → solo las piezas libres en el deposito
router.get("/stock", async (req, res) => {
  try {
    const stock = await piezaModel.findStock();
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /piezas/:id → una pieza por ID
router.get("/:id", async (req, res) => {
  try {
    const pieza = await piezaModel.findById(req.params.id);
    if (!pieza) return res.status(404).json({ error: "Pieza no encontrada" });
    res.json(pieza);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /piezas → agregar nueva pieza al inventario
router.post("/", async (req, res) => {
  try {
    const { id_catalogo, material, color, estado_calidad } = req.body;
    if (!id_catalogo || !material || !color) {
      return res.status(400).json({ error: "Faltan campos: id_catalogo, material, color" });
    }
    const nueva = await piezaModel.create({ id_catalogo, material, color, estado_calidad });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /piezas/:id → editar material y color de una pieza
router.put("/:id", async (req, res) => {
  try {
    const { material, color } = req.body;
    if (!material || !color) {
      return res.status(400).json({ error: "Faltan campos: material, color" });
    }
    const pieza = await piezaModel.findById(req.params.id);
    if (!pieza) return res.status(404).json({ error: "Pieza no encontrada" });

    const actualizada = await piezaModel.update(req.params.id, { material, color });
    res.json({ mensaje: "Pieza actualizada correctamente", pieza: actualizada });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /piezas/:id → eliminar pieza (solo si esta libre)
router.delete("/:id", async (req, res) => {
  try {
    const pieza = await piezaModel.findById(req.params.id);
    if (!pieza) return res.status(404).json({ error: "Pieza no encontrada" });

    if (pieza.id_maniqui !== null) {
      return res.status(400).json({ error: "No se puede eliminar una pieza asignada a un maniquí" });
    }

    await piezaModel.remove(req.params.id);
    res.json({ mensaje: "Pieza eliminada correctamente", pieza });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;