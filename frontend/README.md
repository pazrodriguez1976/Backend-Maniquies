# Sistema de Gestión para Fábrica de Maniquíes - Frontend

Este proyecto contiene la interfaz de usuario (cliente) para el sistema de gestión de una fábrica de maniquíes. Fue desarrollado utilizando React y permite a los usuarios administrar el inventario físico de piezas y controlar el flujo de las órdenes de ensamblaje.

El sistema se comunica mediante peticiones HTTP con una API RESTful (Backend) para persistir y sincronizar los datos.

## Tecnologías Utilizadas

* React (Vite)
* React Router DOM (Manejo de rutas)
* CSS puro (Diseño de la interfaz y sistema de diseño)
* Fetch API (Comunicación con el servidor)

## Requisitos Previos

Para que este proyecto funcione correctamente, es estrictamente necesario tener en ejecución el servidor Backend de la fábrica de maniquíes en el puerto 3000. 

* Node.js instalado en el sistema.
* Backend corriendo localmente en `http://localhost:3000`.
* **Repositorio del Backend:** `https://github.com/pazrodriguez1976/Backend-Maniquies.git`

## Instalación y Ejecución

1. Clonar el repositorio en tu máquina local.
2. Abrir una terminal en el directorio raíz del proyecto.
3. Instalar las dependencias necesarias ejecutando:
   npm install
4. Iniciar el servidor de desarrollo:
   npm run dev
5. Abrir el navegador en la dirección que indique la terminal (por defecto suele ser `http://localhost:5173`).

## Funcionalidades Principales

1. **Gestión de Piezas:** * Visualización del catálogo de piezas (Cabezas, Torsos, Brazos, Piernas).
   * Creación, edición y eliminación de piezas físicas.
   * Filtros integrados por material, color y estado (libre/asignada).
2. **Gestión de Órdenes (Maniquíes):**
   * Creación de nuevas órdenes de ensamblaje.
   * Asignación de piezas desde el stock libre hacia un maniquí específico.
   * Modificación del estado de producción (Pendiente, En proceso, Terminado).
   * Liberación de piezas para devolverlas al inventario general.