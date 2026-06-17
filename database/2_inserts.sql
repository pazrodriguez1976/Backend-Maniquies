
USE fabrica_maniquies;

-- --------------------------------------------------------
-- 1. CARGA DE MODELOS
-- --------------------------------------------------------
INSERT INTO Modelo (id_modelo, nombre_modelo, linea_producto) VALUES
(1, 'Mujer', 'Adulto'),
(2, 'Hombre', 'Adulto'),
(3, 'Niña', 'Infantil'),
(4, 'Niño', 'Infantil');

-- --------------------------------------------------------
-- 2. CARGA DE CATEGORIAS
-- --------------------------------------------------------
INSERT INTO Categoria_Pieza (id_categoria, nombre_categoria) VALUES
(1, 'Cabeza'),
(2, 'Torso'),
(3, 'Brazo Derecho'),
(4, 'Brazo Izquierdo'),
(5, 'Pierna Derecha'),
(6, 'Pierna Izquierda'),
(7, 'Base');

-- --------------------------------------------------------
-- 3. CATALOGO DE PIEZAS
-- --------------------------------------------------------
INSERT INTO Catalogo_Pieza (id_catalogo, id_modelo, id_categoria) VALUES
-- Mujer (101 al 107)
(101, 1, 1), (102, 1, 3), (103, 1, 2), (104, 1, 4), (105, 1, 5), (106, 1, 6), (107, 1, 7),
-- Hombre (201 al 207)
(201, 2, 1), (202, 2, 2), (203, 2, 3), (204, 2, 4), (205, 2, 5), (206, 2, 6), (207, 2, 7),
-- Niña (301 al 307)
(301, 3, 1), (302, 3, 2), (303, 3, 3), (304, 3, 4), (305, 3, 5), (306, 3, 6), (307, 3, 7),
-- Niño (401 al 407)
(401, 4, 1), (402, 4, 2), (403, 4, 3), (404, 4, 4), (405, 4, 5), (406, 4, 6), (407, 4, 7);

-- --------------------------------------------------------
-- 4. ORDENES DE MANIQUIES 
-- --------------------------------------------------------
INSERT INTO Maniqui (id_maniqui, id_modelo, material_requerido, color_requerido, fecha_ensamblaje, estado_ensamblaje) VALUES
(80, 1, 'Plástico', 'Piel', '2024-05-20', 'Ensamblado'),  
(81, 2, 'Fibra', 'Negro', NULL, 'Pendiente'),
(82, 3, 'Fibra', 'Piel', '2024-05-21', 'Ensamblado'),   
(83, 4, 'Madera', 'Caoba', '2024-05-22', 'Ensamblado'), 
(84, 1, 'Plástico', 'Blanco', '2024-05-23', 'Ensamblado'), 
(85, 2, 'Fibra', 'Negro', '2024-05-24', 'Ensamblado');  

-- --------------------------------------------------------
-- 5. INVENTARIO FISICO (Piezas en deposito y ensambladas)
-- --------------------------------------------------------
INSERT INTO Pieza (id_pieza, id_catalogo, material, color, estado_calidad, id_maniqui) VALUES
-- Piezas originales sueltas en deposito (NULL)
(5001, 101, 'Plástico', 'Blanco', 'Disponible', NULL),
(5002, 102, 'Plástico', 'Blanco', 'Disponible', NULL),
(5003, 103, 'Plástico', 'Blanco', 'Disponible', NULL),
(5004, 104, 'Plástico', 'Blanco', 'Disponible', NULL),
(5005, 105, 'Plástico', 'Blanco', 'Disponible', NULL),
(5006, 106, 'Plástico', 'Blanco', 'Disponible', NULL),
(5007, 107, 'Metal', 'Cromado', 'Disponible', NULL), 
(5008, 201, 'Fibra', 'Negro', 'Disponible', NULL),
(5009, 202, 'Fibra', 'Negro', 'Disponible', NULL), 
(5010, 203, 'Fibra', 'Negro', 'Disponible', NULL),
(5011, 204, 'Fibra', 'Negro', 'Disponible', NULL),
(5012, 205, 'Fibra', 'Negro', 'Disponible', NULL),
(5013, 206, 'Fibra', 'Negro', 'Disponible', NULL),
(5014, 207, 'Metal', 'Cromado', 'Disponible', NULL),
(5015, 307, 'Metal', 'Cromado', 'Disponible', NULL),
(5016, 407, 'Metal', 'Cromado', 'Disponible', NULL),
(5017, 301, 'Fibra', 'Piel', 'Disponible', NULL),
(5018, 302, 'Fibra', 'Piel', 'Disponible', NULL),
(5019, 303, 'Fibra', 'Piel', 'Disponible', NULL),
(5020, 304, 'Fibra', 'Piel', 'Disponible', NULL),
(5021, 305, 'Fibra', 'Piel', 'Disponible', NULL),
(5022, 306, 'Fibra', 'Piel', 'Disponible', NULL),
(5023, 401, 'Madera', 'Caoba', 'Disponible', NULL),
(5024, 402, 'Madera', 'Caoba', 'Disponible', NULL),
(5025, 403, 'Madera', 'Caoba', 'Disponible', NULL),
(5027, 404, 'Madera', 'Caoba', 'Disponible', NULL),
(5028, 405, 'Madera', 'Caoba', 'Disponible', NULL),
(5029, 406, 'Madera', 'Caoba', 'Disponible', NULL),

-- Piezas del Maniqui 80 (Mujer)
(5030, 103, 'Plástico', 'Piel', 'Disponible', 80), 
(5031, 104, 'Plástico', 'Piel', 'Disponible', 80), 
(5032, 105, 'Plástico', 'Piel', 'Disponible', 80), 
(5033, 106, 'Plástico', 'Piel', 'Disponible', 80),

-- Piezas del Maniqui 82 (Niña)
(5040, 301, 'Fibra', 'Piel', 'Disponible', 82), (5041, 302, 'Fibra', 'Piel', 'Disponible', 82),
(5042, 303, 'Fibra', 'Piel', 'Disponible', 82), (5043, 304, 'Fibra', 'Piel', 'Disponible', 82),
(5044, 305, 'Fibra', 'Piel', 'Disponible', 82), (5045, 306, 'Fibra', 'Piel', 'Disponible', 82),
(5046, 307, 'Metal', 'Cromado', 'Disponible', 82),

-- Piezas del Maniqui 83 (Niño)
(5047, 401, 'Madera', 'Caoba', 'Disponible', 83), (5048, 402, 'Madera', 'Caoba', 'Disponible', 83),
(5049, 403, 'Madera', 'Caoba', 'Disponible', 83), (5050, 404, 'Madera', 'Caoba', 'Disponible', 83),
(5051, 405, 'Madera', 'Caoba', 'Disponible', 83), (5052, 406, 'Madera', 'Caoba', 'Disponible', 83),
(5053, 407, 'Madera', 'Caoba', 'Disponible', 83),

-- Piezas del Maniqui 84 (Mujer Blanca)
(5054, 101, 'Plástico', 'Blanco', 'Disponible', 84), (5055, 102, 'Plástico', 'Blanco', 'Disponible', 84),
(5056, 103, 'Plástico', 'Blanco', 'Disponible', 84), (5057, 104, 'Plástico', 'Blanco', 'Disponible', 84),
(5058, 105, 'Plástico', 'Blanco', 'Disponible', 84), (5059, 106, 'Plástico', 'Blanco', 'Disponible', 84),
(5060, 107, 'Metal', 'Cromado', 'Disponible', 84),

-- Piezas del Maniqui 85 (Hombre Negro)
(5061, 201, 'Fibra', 'Negro', 'Disponible', 85), (5062, 202, 'Fibra', 'Negro', 'Disponible', 85),
(5063, 203, 'Fibra', 'Negro', 'Disponible', 85), (5064, 204, 'Fibra', 'Negro', 'Disponible', 85),
(5065, 205, 'Fibra', 'Negro', 'Disponible', 85), (5066, 206, 'Fibra', 'Negro', 'Disponible', 85),
(5067, 207, 'Metal', 'Cromado', 'Disponible', 85),

-- Piezas extra para superar las 10 unidades por categoria en el deposito
(5101, 101, 'Plástico', 'Piel', 'Disponible', NULL), (5102, 101, 'Plástico', 'Blanco', 'Disponible', NULL),
(5103, 201, 'Fibra', 'Negro', 'Disponible', NULL), (5104, 301, 'Fibra', 'Piel', 'Disponible', NULL),
(5105, 401, 'Madera', 'Caoba', 'Disponible', NULL), (5106, 101, 'Plástico', 'Piel', 'Dañada', NULL),
(5107, 103, 'Plástico', 'Piel', 'Disponible', NULL), (5108, 103, 'Plástico', 'Blanco', 'Disponible', NULL),
(5109, 202, 'Fibra', 'Negro', 'Disponible', NULL), (5110, 302, 'Fibra', 'Piel', 'Disponible', NULL),
(5111, 402, 'Madera', 'Caoba', 'Disponible', NULL), (5112, 103, 'Plástico', 'Piel', 'Dañada', NULL),
(5113, 102, 'Plástico', 'Piel', 'Disponible', NULL), (5114, 104, 'Plástico', 'Piel', 'Disponible', NULL),
(5115, 203, 'Fibra', 'Negro', 'Disponible', NULL), (5116, 204, 'Fibra', 'Negro', 'Disponible', NULL),
(5117, 105, 'Plástico', 'Piel', 'Disponible', NULL), (5118, 106, 'Plástico', 'Piel', 'Disponible', NULL),
(5119, 205, 'Fibra', 'Negro', 'Disponible', NULL), (5120, 206, 'Fibra', 'Negro', 'Disponible', NULL);