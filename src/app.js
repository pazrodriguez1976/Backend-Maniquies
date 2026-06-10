import express from 'express';
import cors from 'cors';
import piezasRouter from './routes/piezas.js';
import maniquiesRouter from './routes/maniquies.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/piezas',    piezasRouter);
app.use('/maniquies', maniquiesRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});