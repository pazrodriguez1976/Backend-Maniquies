-- ========================================================
-- 1. CREACION DE LA BASE DE DATOS
-- ========================================================
CREATE DATABASE IF NOT EXISTS fabrica_maniquies;
USE fabrica_maniquies;

-- ========================================================
-- 2. CREACION DE TABLAS INDEPENDIENTES (Padres)
-- ========================================================

CREATE TABLE Modelo (
    id_modelo INT PRIMARY KEY,
    nombre_modelo VARCHAR(50) NOT NULL,
    linea_producto VARCHAR(50) NOT NULL
);

CREATE TABLE Categoria_Pieza (
    id_categoria INT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL
);

-- ========================================================
-- 3. CREACION DE TABLAS INTERMEDIAS Y DEPENDIENTES (Hijas)
-- ========================================================

CREATE TABLE Catalogo_Pieza (
    id_catalogo INT PRIMARY KEY,
    id_modelo INT NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_modelo) REFERENCES Modelo(id_modelo),
    FOREIGN KEY (id_categoria) REFERENCES Categoria_Pieza(id_categoria)
);

CREATE TABLE Maniqui (
    id_maniqui INT PRIMARY KEY,
    id_modelo INT NOT NULL,
    material_requerido VARCHAR(50) NOT NULL,
    color_requerido VARCHAR(50) NOT NULL,
    fecha_ensamblaje DATE,
    estado_ensamblaje VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_modelo) REFERENCES Modelo(id_modelo)
);

-- La tabla Pieza va ultima porque depende del Catalogo y del Maniqui
CREATE TABLE Pieza (
    id_pieza INT PRIMARY KEY,
    id_catalogo INT NOT NULL,
    material VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    estado_calidad VARCHAR(50) NOT NULL,
    id_maniqui INT NULL, -- Es NULL si esta en el deposito libre
    FOREIGN KEY (id_catalogo) REFERENCES Catalogo_Pieza(id_catalogo),
    FOREIGN KEY (id_maniqui) REFERENCES Maniqui(id_maniqui)
);