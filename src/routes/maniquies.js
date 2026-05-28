const express = require("express");
const router = express.Router();
const { maniquies, piezas, catalogo_piezas } = require("../data/db");

// GET /maniquies → todas las órdenes
router.get("/", (req, res) => {
  res.json(maniquies);
});

// GET /maniquies/:id → detalle con sus piezas asignadas
router.get("/:id", (req, res) => {
  const maniqui = maniquies.find((m) => m.id === parseInt(req.params.id));
  if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

  // Filtra las piezas y agrega la descripción
  const piezasAsignadas = piezas
    .filter((p) => p.id_maniqui === maniqui.id)
    .map((pieza) => {
      const infoCatalogo = catalogo_piezas.find(c => c.id === pieza.id_catalogo);
      return {
        ...pieza,
        descripcion: infoCatalogo ? infoCatalogo.descripcion : "Pieza desconocida"
      };
    });

  res.json({ ...maniqui, piezas: piezasAsignadas });
});

// POST /maniquies → crear orden de ensamblaje
router.post("/", (req, res) => {
  const { material, color } = req.body;
  if (!material || !color) {
    return res.status(400).json({ error: "Faltan campos: material, color" });
  }
  const nuevoManiqui = {
    id: maniquies.length + 1,
    material,
    color,
    estado: "Pendiente",
  };
  maniquies.push(nuevoManiqui);
  res.status(201).json(nuevoManiqui);
});

// PUT /maniquies/:id → editar un maniquí
router.put("/:id", (req, res) => {
  const maniqui = maniquies.find((m) => m.id === parseInt(req.params.id));
  if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

  const { material, color } = req.body;
  if (!material || !color) {
    return res.status(400).json({ error: "Faltan campos: material, color" });
  }

  maniqui.material = material;
  maniqui.color = color;

  res.json({ mensaje: "Maniquí actualizado correctamente", maniqui });
});

// DELETE /maniquies/:id → eliminar maniquí y liberar sus piezas
router.delete("/:id", (req, res) => {
  const index = maniquies.findIndex((m) => m.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Maniquí no encontrado" });

  const maniqui = maniquies[index];

  // Liberar todas las piezas asignadas a este maniquí
  piezas.forEach((p) => {
    if (p.id_maniqui === maniqui.id) p.id_maniqui = null;
  });

  maniquies.splice(index, 1);
  res.json({ mensaje: "Maniquí eliminado y piezas liberadas correctamente" });
});

// PATCH /maniquies/:id/estado → cambiar estado del maniquí
router.patch("/:id/estado", (req, res) => {
  const maniqui = maniquies.find((m) => m.id === parseInt(req.params.id));
  if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

  const estadosValidos = ["Pendiente", "En proceso", "Terminado"];
  const { estado } = req.body;

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Usá: ${estadosValidos.join(", ")}` });
  }

  maniqui.estado = estado;
  res.json({ mensaje: "Estado actualizado correctamente", maniqui });
});


// PATCH /maniquies/:id/asignar-pieza → asignar una pieza libre al maniquí
router.patch("/:id/asignar-pieza", (req, res) => {
  const { id_pieza } = req.body;
  
  // 1. Busco el maniquí
  const maniqui = maniquies.find((m) => m.id === parseInt(req.params.id));
  if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

  // 2. Busco la pieza que quiero asignar y valido que esté libre (id_maniqui === null)
  const piezaNueva = piezas.find((p) => p.id === id_pieza && p.id_maniqui === null);
  if (!piezaNueva) return res.status(404).json({ error: "Pieza no disponible o ya asignada" });

  // 3. Busco a qué categoría pertenece la pieza nueva consultando el catálogo
  const catalogoNueva = catalogo_piezas.find(c => c.id === piezaNueva.id_catalogo);
  if (!catalogoNueva) return res.status(500).json({ error: "Error interno: La pieza no tiene un catálogo válido." });
  const idCategoriaNueva = catalogoNueva.id_categoria;

  // 4. Valido si el maniquí ya tiene una pieza de esta misma categoría
  // Obtengo todas las piezas que ya están asignadas a este maniquí
  const piezasDelManiqui = piezas.filter((p) => p.id_maniqui === maniqui.id);
  
  // Verifico si alguna de esas piezas comparte la id_categoria
  const yaTieneCategoria = piezasDelManiqui.some((p) => {
    const catalogoAsignada = catalogo_piezas.find(c => c.id === p.id_catalogo);
    return catalogoAsignada && catalogoAsignada.id_categoria === idCategoriaNueva;
  });

  if (yaTieneCategoria) {
    return res.status(400).json({ error: "El maniquí ya tiene una pieza de esa categoría asignada." });
  }

  // 5. Si pasa todas las validaciones, procedo a realizar la asignación
  piezaNueva.id_maniqui = maniqui.id;
  res.json({ mensaje: "Pieza asignada correctamente", pieza: piezaNueva });
});

// PATCH /maniquies/:id/liberar-pieza → desasignar una pieza del maniquí
router.patch("/:id/liberar-pieza", (req, res) => {
  const { id_pieza } = req.body;
  const maniqui = maniquies.find((m) => m.id === parseInt(req.params.id));
  if (!maniqui) return res.status(404).json({ error: "Maniquí no encontrado" });

  const pieza = piezas.find((p) => p.id === id_pieza && p.id_maniqui === maniqui.id);
  if (!pieza) return res.status(404).json({ error: "La pieza no está asignada a este maniquí" });

  pieza.id_maniqui = null;
  res.json({ mensaje: "Pieza liberada correctamente", pieza });
});

module.exports = router;