const modelos = [
  { id: 1, nombre: "Hombre" },
  { id: 2, nombre: "Mujer" },
  { id: 3, nombre: "Niña" },
  { id: 4, nombre: "Niño" },
];

const categorias_pieza = [
  { id: 1, nombre: "Cabeza" },
  { id: 2, nombre: "Torso" },
  { id: 3, nombre: "Brazos" },
  { id: 4, nombre: "Piernas" },
];

const catalogo_piezas = [
  { id: 1,  id_modelo: 2, id_categoria: 1, descripcion: "Cabeza de Mujer" },
  { id: 2,  id_modelo: 1, id_categoria: 1, descripcion: "Cabeza de Hombre" },
  { id: 3,  id_modelo: 2, id_categoria: 2, descripcion: "Torso de Mujer" },
  { id: 4,  id_modelo: 1, id_categoria: 2, descripcion: "Torso de Hombre" },
  { id: 5,  id_modelo: 3, id_categoria: 1, descripcion: "Cabeza de Niña" },
  { id: 6,  id_modelo: 4, id_categoria: 1, descripcion: "Cabeza de Niño" },
  { id: 7,  id_modelo: 2, id_categoria: 3, descripcion: "Brazos de Mujer" },
  { id: 8,  id_modelo: 1, id_categoria: 3, descripcion: "Brazos de Hombre" },
  { id: 9,  id_modelo: 2, id_categoria: 4, descripcion: "Piernas de Mujer" },
  { id: 10, id_modelo: 1, id_categoria: 4, descripcion: "Piernas de Hombre" },
];

const piezas = [
  // Maniquí de Mujer Completo 
  { id: 1, id_catalogo: 1, material: "Plástico", color: "Blanco", id_maniqui: null },
  { id: 2, id_catalogo: 3, material: "Plástico", color: "Blanco", id_maniqui: null },
  { id: 3, id_catalogo: 7, material: "Plástico", color: "Blanco", id_maniqui: null },
  { id: 4, id_catalogo: 9, material: "Plástico", color: "Blanco", id_maniqui: null },
  
  // Repuestos extra en depósito
  { id: 5, id_catalogo: 5, material: "Plástico", color: "Blanco", id_maniqui: null },
  { id: 6, id_catalogo: 8, material: "Fibra",    color: "Negro",  id_maniqui: null },
];

const maniquies = [];

module.exports = { modelos, categorias_pieza, catalogo_piezas, piezas, maniquies };