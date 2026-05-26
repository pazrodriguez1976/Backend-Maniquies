# Sistema de Gestión para Fábrica de Maniquíes - Backend

Este proyecto consiste en el desarrollo del backend para un sistema de gestión de una fábrica de maniquíes, construido con **Node.js** y **Express.js**. La aplicación permite administrar el inventario de piezas y controlar las órdenes de ensamblaje de los maniquíes.

Actualmente, el sistema simula la persistencia de datos utilizando arreglos en memoria antes de su integración definitiva con un motor de bases de datos relacional (MySQL).

---

## Estructura del Proyecto

```
backend-maniquies/
├── src/
│   ├── data/
│   │   └── db.js           ← Arreglos en memoria (simulan las tablas de la BD)
│   ├── routes/
│   │   ├── piezas.js       ← Rutas y lógica para gestión de piezas
│   │   └── maniquies.js    ← Rutas y lógica para gestión de maniquíes
│   └── app.js              ← Punto de entrada, configuración del servidor
├── package.json
└── .gitignore
```

**Descripción de cada archivo:**

- `src/app.js`: Punto de entrada de la aplicación. Configura el servidor Express, los middlewares y centraliza las rutas globales.
- `src/data/db.js`: Módulo que contiene los arreglos en memoria que simulan las tablas de la base de datos (Modelos, Categorías de Piezas, Catálogo de Piezas, Piezas e Inventario de Maniquíes).
- `src/routes/piezas.js`: Definición de rutas y lógica de negocio para la gestión de piezas del inventario.
- `src/routes/maniquies.js`: Definición de rutas y lógica de negocio para la gestión de órdenes de ensamblaje y asignación de piezas.
- `.gitignore`: Archivo para excluir la carpeta de dependencias (`node_modules`) del control de versiones.

---

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)
- Thunder Client (extensión de VS Code) o Postman para probar los endpoints

---

## Instalación y Ejecución

1. Clonar o descargar el repositorio del proyecto.

2. Abrir una terminal en el directorio raíz del proyecto.

3. Instalar las dependencias:

```bash
npm install
```

4. Iniciar el servidor:

```bash
node src/app.js
```

El servidor se levantará en: `http://localhost:3000`

---

## Documentación de la API

### Gestión de Piezas

---

#### `GET /piezas`

Obtiene el listado de todas las piezas registradas en el inventario. Admite filtros opcionales por query params.

**Parámetros opcionales (Query Params):**

| Parámetro | Tipo   | Descripción                        |
|-----------|--------|------------------------------------|
| material  | string | Filtra por tipo de material        |
| color     | string | Filtra por color                   |

**Ejemplo de request:**
```
GET http://localhost:3000/piezas?material=Plástico&color=Blanco
```

**Ejemplo de response exitoso `200 OK`:**
```json
[
  {
    "id": 1,
    "id_catalogo": 1,
    "material": "Plástico",
    "color": "Blanco",
    "id_maniqui": null
  }
]
```

---

#### `GET /piezas/stock`

Obtiene únicamente las piezas libres en el depósito (campo `id_maniqui` igual a `null`).

**Ejemplo de request:**
```
GET http://localhost:3000/piezas/stock
```

**Ejemplo de response exitoso `200 OK`:**
```json
[
  {
    "id": 1,
    "id_catalogo": 1,
    "material": "Plástico",
    "color": "Blanco",
    "id_maniqui": null
  }
]
```

---

#### `GET /piezas/:id`

Obtiene el detalle de una pieza específica por su ID.

**Ejemplo de request:**
```
GET http://localhost:3000/piezas/1
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "id": 1,
  "id_catalogo": 1,
  "material": "Plástico",
  "color": "Blanco",
  "id_maniqui": null
}
```

**Response de error `404 Not Found`:**
```json
{
  "error": "Pieza no encontrada"
}
```

---

#### `POST /piezas`

Agrega una nueva pieza al inventario. El campo `id_maniqui` se inicializa automáticamente en `null`.

**Body (JSON):**
```json
{
  "id_catalogo": 1,
  "material": "Plástico",
  "color": "Blanco"
}
```

**Ejemplo de response exitoso `201 Created`:**
```json
{
  "id": 5,
  "id_catalogo": 1,
  "material": "Plástico",
  "color": "Blanco",
  "id_maniqui": null
}
```

**Response de error `400 Bad Request`:**
```json
{
  "error": "Faltan campos: id_catalogo, material, color"
}
```

---

#### `PUT /piezas/:id`

Actualiza las propiedades físicas (material y color) de una pieza existente.

**Ejemplo de request:**
```
PUT http://localhost:3000/piezas/1
```

**Body (JSON):**
```json
{
  "material": "Fibra",
  "color": "Gris"
}
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "mensaje": "Pieza actualizada correctamente",
  "pieza": {
    "id": 1,
    "id_catalogo": 1,
    "material": "Fibra",
    "color": "Gris",
    "id_maniqui": null
  }
}
```

---

#### `DELETE /piezas/:id`

Elimina una pieza del inventario. No permite eliminar piezas que estén asignadas a un maniquí.

**Ejemplo de request:**
```
DELETE http://localhost:3000/piezas/1
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "mensaje": "Pieza eliminada correctamente",
  "pieza": {
    "id": 1,
    "id_catalogo": 1,
    "material": "Plástico",
    "color": "Blanco",
    "id_maniqui": null
  }
}
```

**Response de error `400 Bad Request` (pieza asignada):**
```json
{
  "error": "No se puede eliminar una pieza asignada a un maniquí"
}
```

---

### Gestión de Maniquíes (Órdenes de Ensamblaje)

---

#### `GET /maniquies`

Obtiene el listado de todas las órdenes de ensamblaje registradas.

**Ejemplo de request:**
```
GET http://localhost:3000/maniquies
```

**Ejemplo de response exitoso `200 OK`:**
```json
[
  {
    "id": 1,
    "material": "Plástico",
    "color": "Blanco",
    "estado": "Pendiente"
  }
]
```

---

#### `GET /maniquies/:id`

Obtiene el detalle de un maniquí junto con todas las piezas que tiene asignadas actualmente.

**Ejemplo de request:**
```
GET http://localhost:3000/maniquies/1
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "id": 1,
  "material": "Plástico",
  "color": "Blanco",
  "estado": "Pendiente",
  "piezas": [
    {
      "id": 2,
      "id_catalogo": 1,
      "material": "Plástico",
      "color": "Blanco",
      "id_maniqui": 1
    }
  ]
}
```

---

#### `POST /maniquies`

Crea una nueva orden de ensamblaje. El campo `estado` se establece automáticamente como `"Pendiente"`.

**Body (JSON):**
```json
{
  "material": "Plástico",
  "color": "Blanco"
}
```

**Ejemplo de response exitoso `201 Created`:**
```json
{
  "id": 1,
  "material": "Plástico",
  "color": "Blanco",
  "estado": "Pendiente"
}
```

---

#### `PUT /maniquies/:id`

Edita los datos generales (material y color) de un maniquí existente.

**Ejemplo de request:**
```
PUT http://localhost:3000/maniquies/1
```

**Body (JSON):**
```json
{
  "material": "Fibra",
  "color": "Negro"
}
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "mensaje": "Maniquí actualizado correctamente",
  "maniqui": {
    "id": 1,
    "material": "Fibra",
    "color": "Negro",
    "estado": "Pendiente"
  }
}
```

---

#### `PATCH /maniquies/:id/estado`

Actualiza el estado del proceso de ensamblaje de un maniquí.

**Estados válidos:** `"Pendiente"` → `"En proceso"` → `"Terminado"`

**Ejemplo de request:**
```
PATCH http://localhost:3000/maniquies/1/estado
```

**Body (JSON):**
```json
{
  "estado": "En proceso"
}
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "mensaje": "Estado actualizado correctamente",
  "maniqui": {
    "id": 1,
    "material": "Plástico",
    "color": "Blanco",
    "estado": "En proceso"
  }
}
```

**Response de error `400 Bad Request` (estado inválido):**
```json
{
  "error": "Estado inválido. Usá: Pendiente, En proceso, Terminado"
}
```

---

#### `PATCH /maniquies/:id/asignar-pieza`

Vincula una pieza libre del depósito a la orden de ensamblaje del maniquí. Cambia el campo `id_maniqui` de la pieza al ID del maniquí.

**Ejemplo de request:**
```
PATCH http://localhost:3000/maniquies/1/asignar-pieza
```

**Body (JSON):**
```json
{
  "id_pieza": 2
}
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "mensaje": "Pieza asignada correctamente",
  "pieza": {
    "id": 2,
    "id_catalogo": 1,
    "material": "Plástico",
    "color": "Blanco",
    "id_maniqui": 1
  }
}
```

**Response de error `404 Not Found`:**
```json
{
  "error": "Pieza no disponible o ya asignada"
}
```

---

#### `PATCH /maniquies/:id/liberar-pieza`

Desvincula una pieza asignada a un maniquí, dejándola nuevamente libre en el stock del depósito (`id_maniqui` vuelve a `null`).

**Ejemplo de request:**
```
PATCH http://localhost:3000/maniquies/1/liberar-pieza
```

**Body (JSON):**
```json
{
  "id_pieza": 2
}
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "mensaje": "Pieza liberada correctamente",
  "pieza": {
    "id": 2,
    "id_catalogo": 1,
    "material": "Plástico",
    "color": "Blanco",
    "id_maniqui": null
  }
}
```

---

#### `DELETE /maniquies/:id`

Elimina una orden de ensamblaje y libera automáticamente todas las piezas que tenía asignadas (su `id_maniqui` vuelve a `null`).

**Ejemplo de request:**
```
DELETE http://localhost:3000/maniquies/1
```

**Ejemplo de response exitoso `200 OK`:**
```json
{
  "mensaje": "Maniquí eliminado y piezas liberadas correctamente"
}
```

---

## Resumen de Endpoints

| Método   | Endpoint                          | Descripción                                  |
|----------|-----------------------------------|----------------------------------------------|
| GET      | `/piezas`                         | Listar todas las piezas (con filtros opcionales) |
| GET      | `/piezas/stock`                   | Listar piezas libres en depósito             |
| GET      | `/piezas/:id`                     | Obtener una pieza por ID                     |
| POST     | `/piezas`                         | Agregar una nueva pieza al inventario        |
| PUT      | `/piezas/:id`                     | Editar material y color de una pieza         |
| DELETE   | `/piezas/:id`                     | Eliminar una pieza del inventario            |
| GET      | `/maniquies`                      | Listar todas las órdenes de ensamblaje       |
| GET      | `/maniquies/:id`                  | Obtener un maniquí con sus piezas asignadas  |
| POST     | `/maniquies`                      | Crear una nueva orden de ensamblaje          |
| PUT      | `/maniquies/:id`                  | Editar datos generales de un maniquí         |
| DELETE   | `/maniquies/:id`                  | Eliminar un maniquí y liberar sus piezas     |
| PATCH    | `/maniquies/:id/estado`           | Cambiar el estado del ensamblaje             |
| PATCH    | `/maniquies/:id/asignar-pieza`    | Asignar una pieza libre a un maniquí         |
| PATCH    | `/maniquies/:id/liberar-pieza`    | Liberar una pieza asignada a un maniquí      |

---

## Códigos de Respuesta HTTP

| Código | Significado                                              |
|--------|----------------------------------------------------------|
| 200    | OK — La operación se realizó correctamente               |
| 201    | Created — El recurso fue creado exitosamente             |
| 400    | Bad Request — Faltan campos o los datos son inválidos    |
| 404    | Not Found — El recurso solicitado no existe              |
| 500    | Internal Server Error — Error inesperado en el servidor  |

---

## Herramienta de Pruebas

Las pruebas de todos los endpoints se realizaron con **Thunder Client**, extensión de Visual Studio Code. Se validaron los siguientes escenarios para cada endpoint:

- Respuestas exitosas (`200 OK` y `201 Created`)
- Recursos no encontrados (`404 Not Found`)
- Peticiones con datos faltantes o inválidos (`400 Bad Request`)
- Filtros por query params
- Flujo completo: crear maniquí → asignar pieza → cambiar estado → liberar pieza → eliminar maniquí