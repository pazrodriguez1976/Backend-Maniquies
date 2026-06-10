# Sistema de Gestión para Fábrica de Maniquíes - Backend

## Descripción del Proyecto
Este proyecto consiste en el desarrollo del backend para un sistema de gestión de una fábrica de maniquíes, construido con Node.js y Express.js. La aplicación permite administrar el inventario de piezas y controlar las órdenes de ensamblaje de los maniquíes.

El sistema cuenta con dos etapas de desarrollo:
- **Etapa 1:** Persistencia simulada con arreglos en memoria (`src/data/db.js`)
- **Etapa 2:** Integración con base de datos relacional MySQL (`src/db/dbConnect.js`)

---

## Estructura del Proyecto

```
backend-maniquies/
├── src/
│   ├── data/
│   │   └── db.js                ← arreglos en memoria (etapa 1, ya no se usa)
│   ├── db/
│   │   └── dbConnect.js         ← conexión MySQL con patrón Singleton
│   ├── models/
│   │   ├── pieza.model.js       ← queries SQL para piezas
│   │   └── maniqui.model.js     ← queries SQL para maniquíes
│   ├── routes/
│   │   ├── piezas.js            ← endpoints de piezas
│   │   └── maniquies.js         ← endpoints de maniquíes
│   └── app.js                   ← punto de entrada, configuración del servidor
├── package.json
└── .gitignore
```

---

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)
- MySQL Server 8.0 corriendo en el puerto 3307
- Base de datos `fabrica_maniquies` importada (ver sección de base de datos)

---

## Instalación y Ejecución

**1. Instalar dependencias:**
```bash
npm install
```

**2. Verificar que MySQL esté corriendo:**
```bash
sudo systemctl status mysql
```

**3. Iniciar el servidor:**
```bash
node src/app.js
```

Al iniciar correctamente se muestran los siguientes mensajes:
```
Conexión a MySQL establecida correctamente
Servidor corriendo en http://localhost:3000
```

---

## Configuración de la Base de Datos

La base de datos utilizada es `fabrica_maniquies`. Los scripts de creación se encuentran en el repositorio de base de datos del proyecto.

Los scripts deben ejecutarse en este orden:

```bash
mysql -u root -p -P 3307 --protocol=TCP < 1_creates.sql
mysql -u root -p -P 3307 --protocol=TCP < 2_inserts.sql
mysql -u root -p -P 3307 --protocol=TCP fabrica_maniquies < 3_modificaciones.sql
```

### Tablas de la base de datos

| Tabla | Descripción |
|---|---|
| `Modelo` | Tipos de maniquí (Mujer, Hombre, Niña, Niño) |
| `Categoria_Pieza` | Categorías de piezas (Cabeza, Torso, Brazos, etc.) |
| `Catalogo_Pieza` | Combinaciones válidas de modelo y categoría |
| `Maniqui` | Órdenes de ensamblaje |
| `Pieza` | Inventario físico de piezas |

---

## Patrón de Arquitectura

El proyecto sigue el patrón **Ruta → Modelo → Query SQL**, tal como indica la cátedra:

```
routes/piezas.js           ← recibe la petición HTTP
    models/pieza.model.js  ← ejecuta la query SQL
        db/dbConnect.js    ← conexión singleton a MySQL
```

La conexión a MySQL se implementa con el patrón **Singleton**: se crea una única instancia de conexión en `dbConnect.js` y Node.js la reutiliza en todos los módulos que la importan.

---

## Documentación de la API

### Gestión de Piezas

---

#### `GET /piezas`

Obtiene el listado de todas las piezas con descripción armada por JOIN entre `Pieza`, `Catalogo_Pieza`, `Categoria_Pieza` y `Modelo`.

**Parámetros opcionales (Query Params):**

| Parámetro | Tipo | Descripción |
|---|---|---|
| material | string | Filtra por material |
| color | string | Filtra por color |

**Ejemplo de request:**
```
GET http://localhost:3000/piezas?material=Plástico&color=Blanco
```

**Ejemplo de response exitoso `200 OK`:**
```json
[
  {
    "id": 5001,
    "id_catalogo": 101,
    "material": "Plástico",
    "color": "Blanco",
    "estado_calidad": "Disponible",
    "id_maniqui": null,
    "descripcion": "Cabeza de Mujer"
  }
]
```

---

#### `GET /piezas/stock`

Obtiene las piezas con `id_maniqui IS NULL`, es decir, las que están libres en el depósito.

---

#### `GET /piezas/:id`

Obtiene una pieza por su ID.

**Response de error `404 Not Found`:**
```json
{ "error": "Pieza no encontrada" }
```

---

#### `POST /piezas`

Agrega una nueva pieza al inventario. El campo `id_maniqui` se inicializa en `NULL` y `estado_calidad` en `Disponible` automáticamente.

**Body (JSON):**
```json
{
  "id_catalogo": 101,
  "material": "Plástico",
  "color": "Blanco"
}
```

**Ejemplo de response exitoso `201 Created`:**
```json
{
  "id": 5122,
  "id_catalogo": 101,
  "material": "Plástico",
  "color": "Blanco",
  "estado_calidad": "Disponible",
  "id_maniqui": null,
  "descripcion": "Cabeza de Mujer"
}
```

---

#### `PUT /piezas/:id`

Actualiza el material y color de una pieza.

**Body (JSON):**
```json
{
  "material": "Fibra",
  "color": "Negro"
}
```

---

#### `DELETE /piezas/:id`

Elimina una pieza del inventario. No permite eliminar piezas asignadas a un maniquí.

**Response de error `400 Bad Request`:**
```json
{ "error": "No se puede eliminar una pieza asignada a un maniquí" }
```

---

### Gestión de Maniquíes

---

#### `GET /maniquies`

Obtiene todas las órdenes de ensamblaje con JOIN a la tabla `Modelo`.

**Ejemplo de response exitoso `200 OK`:**
```json
[
  {
    "id": 80,
    "id_modelo": 1,
    "nombre_modelo": "Mujer",
    "material": "Plástico",
    "color": "Piel",
    "fecha_ensamblaje": "2024-05-20T03:00:00.000Z",
    "estado": "Ensamblado"
  }
]
```

---

#### `GET /maniquies/:id`

Obtiene el detalle de un maniquí junto con todas sus piezas asignadas.

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "id": 80,
  "id_modelo": 1,
  "nombre_modelo": "Mujer",
  "material": "Plástico",
  "color": "Piel",
  "fecha_ensamblaje": "2024-05-20T03:00:00.000Z",
  "estado": "Ensamblado",
  "piezas": [
    {
      "id": 5030,
      "id_catalogo": 103,
      "material": "Plástico",
      "color": "Piel",
      "estado_calidad": "Disponible",
      "id_maniqui": 80,
      "descripcion": "Torso de Mujer"
    }
  ]
}
```

---

#### `POST /maniquies`

Crea una nueva orden de ensamblaje. El estado se inicializa en `Pendiente` automáticamente.

**Body (JSON):**
```json
{
  "id_modelo": 1,
  "material": "Plástico",
  "color": "Blanco"
}
```

**Ejemplo de response exitoso `201 Created`:**
```json
{
  "id": 87,
  "id_modelo": 1,
  "nombre_modelo": "Mujer",
  "material": "Plástico",
  "color": "Blanco",
  "fecha_ensamblaje": null,
  "estado": "Pendiente",
  "piezas": []
}
```

---

#### `PUT /maniquies/:id`

Edita el material y color de un maniquí.

**Body (JSON):**
```json
{
  "material": "Fibra",
  "color": "Negro"
}
```

---

#### `DELETE /maniquies/:id`

Elimina un maniquí. Antes de eliminarlo libera todas sus piezas asignadas (`UPDATE Pieza SET id_maniqui = NULL`).

---

#### `PATCH /maniquies/:id/estado`

Actualiza el estado del ensamblaje.

**Estados válidos:** `Pendiente`, `En proceso`, `Ensamblado`

**Body (JSON):**
```json
{
  "estado": "Ensamblado"
}
```

---

#### `PATCH /maniquies/:id/asignar-pieza`

Asigna una pieza libre al maniquí. Valida que la pieza esté libre y que el maniquí no tenga ya una pieza de la misma categoría.

**Body (JSON):**
```json
{
  "id_pieza": 5008
}
```

**Response de error `400 Bad Request`:**
```json
{ "error": "El maniquí ya tiene una pieza de esa categoría asignada" }
```

---

#### `PATCH /maniquies/:id/liberar-pieza`

Desasigna una pieza del maniquí, dejándola libre en el depósito (`id_maniqui = NULL`).

**Body (JSON):**
```json
{
  "id_pieza": 5008
}
```

---

## Resumen de Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/piezas` | Listar todas las piezas con filtros opcionales |
| GET | `/piezas/stock` | Listar piezas libres en el depósito |
| GET | `/piezas/:id` | Obtener una pieza por ID |
| POST | `/piezas` | Agregar nueva pieza al inventario |
| PUT | `/piezas/:id` | Editar material y color de una pieza |
| DELETE | `/piezas/:id` | Eliminar una pieza |
| GET | `/maniquies` | Listar todas las órdenes de ensamblaje |
| GET | `/maniquies/:id` | Obtener un maniquí con sus piezas asignadas |
| POST | `/maniquies` | Crear nueva orden de ensamblaje |
| PUT | `/maniquies/:id` | Editar datos de un maniquí |
| DELETE | `/maniquies/:id` | Eliminar un maniquí y liberar sus piezas |
| PATCH | `/maniquies/:id/estado` | Cambiar el estado del ensamblaje |
| PATCH | `/maniquies/:id/asignar-pieza` | Asignar una pieza libre a un maniquí |
| PATCH | `/maniquies/:id/liberar-pieza` | Liberar una pieza de un maniquí |

---

## Códigos de Respuesta HTTP

| Código | Significado |
|---|---|
| 200 | OK — operación exitosa |
| 201 | Created — recurso creado correctamente |
| 400 | Bad Request — datos faltantes o inválidos |
| 404 | Not Found — recurso no encontrado |
| 500 | Internal Server Error — error en el servidor o en la base de datos |

---

## Herramienta de Pruebas

Las pruebas de todos los endpoints se realizaron con **Thunder Client**, extensión de Visual Studio Code. Se validaron respuestas exitosas, errores 404, errores 400 y el flujo completo de crear un maniquí, asignar piezas, cambiar estado y eliminar.