-- ========================================================
-- MODIFICACIONES PARA ADAPTAR EL MODELO A LAS CONSULTAS
-- ========================================================

-- 1. Agrego la columna de fecha que no existia originalmente
ALTER TABLE Pieza 
ADD fecha_fabricacion DATE;

-- 2. Agrego fechas antiguas (2025) a tres cabezas
UPDATE Pieza 
SET fecha_fabricacion = '2025-05-10' 
WHERE id_pieza IN (5001, 5008, 5017);

-- 3. Agrego fechas nuevas (2026) a cinco cabezas (Para que la Consulta 2 funcione)
UPDATE Pieza 
SET fecha_fabricacion = '2026-03-15' 
WHERE id_pieza IN (5101, 5102, 5103);

UPDATE Pieza 
SET fecha_fabricacion = '2026-08-20' 
WHERE id_pieza IN (5104, 5105);