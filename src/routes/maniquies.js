const express = require("express");
const router = express.Router();
const maniquiModel = require('../models/maniqui.model');

const ESTADOS_VALIDOS = ["Pendiente", "En proceso", "Ensamblado"];

// GET /maniquies → todos los maniquies
router.get("/", async (req, res) => {
  try {
    const maniquies = await maniquiModel.findAll();
    res.json(maniquies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /maniquies/:id → maniqui con sus piezas asignadas
router.get("/:id", async (req, res) => {
  try {
    const maniqui = await maniquiModel.findById(req.params.id);
    if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });
    res.json(maniqui);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /maniquies → crear nueva orden de ensamblaje
router.post("/", async (req, res) => {
  try {
    const { id_modelo, material, color } = req.body;
    if (!id_modelo || !material || !color) {
      return res.status(400).json({ error: "Faltan campos: id_modelo, material, color" });
    }
    const nuevo = await maniquiModel.create({ id_modelo, material, color });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /maniquies/:id → editar material y color
router.put("/:id", async (req, res) => {
  try {
    const { material, color } = req.body;
    if (!material || !color) {
      return res.status(400).json({ error: "Faltan campos: material, color" });
    }
    const maniqui = await maniquiModel.findById(req.params.id);
    if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

    const actualizado = await maniquiModel.update(req.params.id, { material, color });
    res.json({ mensaje: "Maniquí actualizado correctamente", maniqui: actualizado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /maniquies/:id → eliminar maniqui y liberar sus piezas
router.delete("/:id", async (req, res) => {
  try {
    const maniqui = await maniquiModel.findById(req.params.id);
    if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

    await maniquiModel.remove(req.params.id);
    res.json({ mensaje: "Maniquí eliminado y piezas liberadas correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /maniquies/:id/estado → cambiar estado del ensamblaje
router.patch("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Usá: ${ESTADOS_VALIDOS.join(", ")}` });
    }
    const maniqui = await maniquiModel.findById(req.params.id);
    if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

    const actualizado = await maniquiModel.updateEstado(req.params.id, estado);
    res.json({ mensaje: "Estado actualizado correctamente", maniqui: actualizado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /maniquies/:id/asignar-pieza → asignar pieza libre al maniqui
router.patch("/:id/asignar-pieza", async (req, res) => {
  try {
    const { id_pieza } = req.body;
    const maniqui = await maniquiModel.findById(req.params.id);
    if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

    const resultado = await maniquiModel.asignarPieza(req.params.id, id_pieza);
    if (resultado.error) return res.status(400).json({ error: resultado.error });

    res.json({ mensaje: "Pieza asignada correctamente", pieza: resultado.pieza });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /maniquies/:id/liberar-pieza → desasignar pieza del maniquí
router.patch("/:id/liberar-pieza", async (req, res) => {
  try {
    const { id_pieza } = req.body;
    const maniqui = await maniquiModel.findById(req.params.id);
    if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

    const resultado = await maniquiModel.liberarPieza(req.params.id, id_pieza);
    if (resultado.error) return res.status(404).json({ error: resultado.error });

    res.json({ mensaje: "Pieza liberada correctamente", pieza: resultado.pieza });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;