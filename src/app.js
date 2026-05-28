const express = require("express");
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

const piezasRouter = require("./routes/piezas");
const maniquiesRouter = require("./routes/maniquies");

app.use("/piezas", piezasRouter);
app.use("/maniquies", maniquiesRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});