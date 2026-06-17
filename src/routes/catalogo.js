import { Router } from 'express';
import catalogoModel from '../models/catalogo.model.js';

const router = Router();

// GET /catalogo → lista de tipos de pieza (modelo + categoría)
router.get('/', async (req, res) => {
  try {
    const catalogo = await catalogoModel.findAll();
    res.json(catalogo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;