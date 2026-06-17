import { Router } from 'express';
import modeloModel from '../models/modelo.model.js';

const router = Router();

// GET /modelos → lista de modelos de maniquí
router.get('/', async (req, res) => {
  try {
    const modelos = await modeloModel.findAll();
    res.json(modelos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;