const BASE = 'http://localhost:3000'

// Helper para manejar errores de red
const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

// ── PIEZAS ──────────────────────────────────────────────────────────────────

// GET /piezas  (con filtros opcionales por query params)
export const getPiezas = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.material) params.append('material', filtros.material)
  if (filtros.color)    params.append('color',    filtros.color)
  const query = params.toString() ? `?${params}` : ''
  return fetch(`${BASE}/piezas${query}`).then(handleResponse)
}

// GET /piezas/stock  → solo las piezas libres (id_maniqui === null)
export const getPiezasStock = () =>
  fetch(`${BASE}/piezas/stock`).then(handleResponse)

// GET /piezas/:id
export const getPiezaById = (id) =>
  fetch(`${BASE}/piezas/${id}`).then(handleResponse)

// POST /piezas
export const createPieza = (data) =>
  fetch(`${BASE}/piezas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse)

// PUT /piezas/:id  → editar material y color
export const updatePieza = (id, data) =>
  fetch(`${BASE}/piezas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse)

// DELETE /piezas/:id
export const deletePieza = (id) =>
  fetch(`${BASE}/piezas/${id}`, { method: 'DELETE' }).then(handleResponse)

// ── MANIQUIES ────────────────────────────────────────────────────────────────

// GET /maniquies
export const getManiquies = () =>
  fetch(`${BASE}/maniquies`).then(handleResponse)

// GET /maniquies/:id  → incluye piezas asignadas en la respuesta
export const getManiquiById = (id) =>
  fetch(`${BASE}/maniquies/${id}`).then(handleResponse)

// POST /maniquies  → crea con estado "Pendiente" automático
export const createManiqui = (data) =>
  fetch(`${BASE}/maniquies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse)

// PUT /maniquies/:id  → editar material y color
export const updateManiqui = (id, data) =>
  fetch(`${BASE}/maniquies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse)

// DELETE /maniquies/:id
export const deleteManiqui = (id) =>
  fetch(`${BASE}/maniquies/${id}`, { method: 'DELETE' }).then(handleResponse)

// PATCH /maniquies/:id/estado  → cambiar estado del maniquí
export const cambiarEstado = (id, estado) =>
  fetch(`${BASE}/maniquies/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  }).then(handleResponse)

// PATCH /maniquies/:id/asignar-pieza  → asigna pieza libre al maniquí
export const asignarPieza = (id_maniqui, id_pieza) =>
  fetch(`${BASE}/maniquies/${id_maniqui}/asignar-pieza`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_pieza })
  }).then(handleResponse)

// PATCH /maniquies/:id/liberar-pieza  → desasigna pieza del maniquí
export const liberarPieza = (id_maniqui, id_pieza) =>
  fetch(`${BASE}/maniquies/${id_maniqui}/liberar-pieza`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_pieza })
  }).then(handleResponse)
