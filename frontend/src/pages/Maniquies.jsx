import { useState, useEffect } from 'react'
import Modal from '../components/Modal.jsx'
import {
  getManiquies, getManiquiById,
  createManiqui, updateManiqui, deleteManiqui,
  cambiarEstado, asignarPieza, liberarPieza,
  getPiezasStock
} from '../api/index.js'

const ESTADOS    = ['Pendiente', 'En proceso', 'Terminado']
const MATERIALES = ['Plástico', 'Fibra', 'Madera', 'Metal']
const COLORES    = ['Blanco', 'Negro', 'Gris', 'Beige', 'Rojo']

const CATALOGO = [
  { id: 1,  descripcion: 'Cabeza de Mujer'   },
  { id: 2,  descripcion: 'Cabeza de Hombre'  },
  { id: 3,  descripcion: 'Torso de Mujer'    },
  { id: 4,  descripcion: 'Torso de Hombre'   },
  { id: 5,  descripcion: 'Cabeza de Niña'    },
  { id: 6,  descripcion: 'Cabeza de Niño'    },
  { id: 7,  descripcion: 'Brazos de Mujer'   },
  { id: 8,  descripcion: 'Brazos de Hombre'  },
  { id: 9,  descripcion: 'Piernas de Mujer'  },
  { id: 10, descripcion: 'Piernas de Hombre' },
];

const nombreCatalogo = (id) =>
  CATALOGO.find(c => c.id === Number(id))?.descripcion ?? `Catálogo #${id}`;

const badgeEstado = (e) => {
  if (e === 'Pendiente')  return 'badge-pendiente'
  if (e === 'En proceso') return 'badge-proceso'
  if (e === 'Terminado')  return 'badge-terminado'
  return ''
}

export default function Maniquies() {
  const [maniquies,    setManiquies]    = useState([])
  const [piezasStock,  setPiezasStock]  = useState([])  // piezas libres del depósito
  const [error,        setError]        = useState(null)
  const [modal,        setModal]        = useState(null)
  // modal: null | 'crear' | 'editar' | 'estado' | 'piezas'
  const [seleccionado, setSeleccionado] = useState(null)
  const [detalle,      setDetalle]      = useState(null) // GET /maniquies/:id con piezas
  const [form,         setForm]         = useState({ material: '', color: '' })
  const [nuevoEstado,  setNuevoEstado]  = useState('')
  const [piezaAsignar, setPiezaAsignar] = useState('')

  const cargar = async () => {
    try {
      setError(null)
      // GET /maniquies → lista completa
      const m = await getManiquies()
      setManiquies(m)
      // GET /piezas/stock → solo las libres (para poder asignar)
      const stock = await getPiezasStock()
      setPiezasStock(stock)
    } catch {
      setError('No se pudo conectar al backend. ¿Está corriendo en localhost:3000?')
    }
  }

  useEffect(() => { cargar() }, [])

  const cerrar = () => { setModal(null); setSeleccionado(null); setDetalle(null) }

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // ── Crear ──────────────────────────────────────────────
  const abrirCrear = () => {
    setForm({ material: '', color: '' })
    setModal('crear')
  }

  // ── Editar ─────────────────────────────────────────────
  const abrirEditar = (m) => {
    setForm({ material: m.material, color: m.color })
    setSeleccionado(m)
    setModal('editar')
  }

  const handleSubmitForm = async () => {
    if (!form.material || !form.color) { alert('Completá todos los campos'); return }
    try {
      if (modal === 'crear') {
        // POST /maniquies → backend pone estado: "Pendiente"
        await createManiqui(form)
      } else {
        // PUT /maniquies/:id
        await updateManiqui(seleccionado.id, { ...seleccionado, ...form })
      }
      cerrar(); cargar()
    } catch (e) { alert(`Error: ${e.message}`) }
  }

  // ── Eliminar ───────────────────────────────────────────
  const handleEliminar = async (m) => {
    if (!confirm(`¿Eliminar maniquí #${m.id}? El backend liberará sus piezas automáticamente.`)) return
    try {
      // DELETE /maniquies/:id → el backend libera las piezas
      await deleteManiqui(m.id)
      cargar()
    } catch (e) { alert(`Error: ${e.message}`) }
  }

  // ── Estado ─────────────────────────────────────────────
  const abrirEstado = (m) => {
    setSeleccionado(m)
    setNuevoEstado(m.estado)
    setModal('estado')
  }

  const handleCambiarEstado = async () => {
    try {
      // PATCH /maniquies/:id/estado
      await cambiarEstado(seleccionado.id, nuevoEstado)
      cerrar(); cargar()
    } catch (e) { alert(`Error: ${e.message}`) }
  }

  // ── Piezas ─────────────────────────────────────────────
  const abrirPiezas = async (m) => {
    setSeleccionado(m)
    setPiezaAsignar('')
    setModal('piezas')
    try {
      // GET /maniquies/:id → devuelve el maniquí con sus piezas asignadas
      const data = await getManiquiById(m.id)
      setDetalle(data)
    } catch (e) { alert(`Error: ${e.message}`) }
  }

  const recargarDetalle = async () => {
    const data = await getManiquiById(seleccionado.id)
    setDetalle(data)
    const stock = await getPiezasStock()
    setPiezasStock(stock)
  }

  const handleAsignar = async () => {
    if (!piezaAsignar) { alert('Seleccioná una pieza'); return }
    try {
      // PATCH /maniquies/:id/asignar-pieza
      await asignarPieza(seleccionado.id, Number(piezaAsignar))
      setPiezaAsignar('')
      recargarDetalle()
    } catch (e) { alert(`Error: ${e.message}`) }
  }

  const handleLiberar = async (id_pieza) => {
    try {
      // PATCH /maniquies/:id/liberar-pieza
      await liberarPieza(seleccionado.id, id_pieza)
      recargarDetalle()
    } catch (e) { alert(`Error: ${e.message}`) }
  }

  // Stats
  const pendientes = maniquies.filter(m => m.estado === 'Pendiente').length
  const enProceso  = maniquies.filter(m => m.estado === 'En proceso').length
  const terminados = maniquies.filter(m => m.estado === 'Terminado').length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">MANIQUÍES</h1>
          <p className="page-subtitle">Órdenes de ensamblaje</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nueva Orden</button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {/* Stats */}
      <div className="stats">
        <div className="stat"><div className="stat-value">{maniquies.length}</div><div className="stat-label">Total órdenes</div></div>
        <div className="stat"><div className="stat-value">{pendientes}</div><div className="stat-label">Pendientes</div></div>
        <div className="stat"><div className="stat-value">{enProceso}</div><div className="stat-label">En proceso</div></div>
        <div className="stat"><div className="stat-value">{terminados}</div><div className="stat-label">Terminados</div></div>
      </div>

      {/* Tabla */}
      {maniquies.length === 0 && !error ? (
        <div className="empty">
          <div className="empty-icon">🗿</div>
          <p>No hay órdenes de ensamblaje todavía.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Material</th>
                <th>Color</th>
                <th>Estado</th>
                <th>Piezas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maniquies.map(m => (
                <tr key={m.id}>
                  <td style={{ color: 'var(--muted)' }}>{m.id}</td>
                  <td>{m.material}</td>
                  <td>{m.color}</td>
                  <td>
                    <span className={`badge ${badgeEstado(m.estado)}`}>{m.estado}</span>
                  </td>
                  <td>
                    {/* Abre modal que llama a GET /maniquies/:id */}
                    <button className="btn btn-outline btn-sm" onClick={() => abrirPiezas(m)}>
                      🔩 Ver piezas
                    </button>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => abrirEstado(m)}>Estado</button>
                      <button className="btn btn-outline btn-sm" onClick={() => abrirEditar(m)}>Editar</button>
                      <button className="btn btn-danger btn-sm"  onClick={() => handleEliminar(m)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Crear / Editar ── */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal title={modal === 'crear' ? 'NUEVA ORDEN' : 'EDITAR MANIQUÍ'} onClose={cerrar}>
          <div className="form-group">
            <label>Material</label>
            <select name="material" value={form.material} onChange={handleChange}>
              <option value="">Seleccioná...</option>
              {MATERIALES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Color</label>
            <select name="color" value={form.color} onChange={handleChange}>
              <option value="">Seleccioná...</option>
              {COLORES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {modal === 'crear' && (
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
           
            </p>
          )}
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={cerrar}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmitForm}>
              {modal === 'crear' ? 'Crear orden' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Estado ── */}
      {modal === 'estado' && seleccionado && (
        <Modal title="CAMBIAR ESTADO" onClose={cerrar}>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Maniquí #{seleccionado.id} · {seleccionado.material} {seleccionado.color}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1rem' }}>
    
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {ESTADOS.map(e => (
              <button
                key={e}
                onClick={() => setNuevoEstado(e)}
                className="badge"
                style={{
                  cursor: 'pointer',
                  border: nuevoEstado === e ? '2px solid var(--accent)' : '2px solid transparent',
                  padding: '0.5rem 1rem',
                  ...(e === 'Pendiente'  ? { background: 'rgba(251,191,36,0.15)',  color: 'var(--warning)' } : {}),
                  ...(e === 'En proceso' ? { background: 'rgba(249,115,22,0.15)',  color: 'var(--accent)'  } : {}),
                  ...(e === 'Terminado'  ? { background: 'rgba(74,222,128,0.15)',  color: 'var(--success)' } : {}),
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={cerrar}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCambiarEstado}>Confirmar</button>
          </div>
        </Modal>
      )}

      {/* ── Modal Piezas ── */}
      {modal === 'piezas' && seleccionado && (
        <Modal title={`PIEZAS — MANIQUÍ #${seleccionado.id}`} onClose={cerrar}>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {seleccionado.material} · {seleccionado.color} ·{' '}
            <span className={`badge ${badgeEstado(seleccionado.estado)}`}>{seleccionado.estado}</span>
          </p>

          {/* Piezas asignadas → vienen de GET /maniquies/:id */}
          <label>Piezas asignadas</label>
          {!detalle ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.5rem 0 1rem' }}>Cargando...</p>
          ) : detalle.piezas?.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.5rem 0 1rem' }}>Sin piezas asignadas.</p>
          ) : (
            <div className="piezas-list" style={{ marginBottom: '1.25rem' }}>
              {detalle.piezas?.map(p => (
                <div key={p.id} className="pieza-chip">
                  #{p.id} · {p.material} · {p.color}
                  {/* PATCH /maniquies/:id/liberar-pieza */}
                  <button onClick={() => handleLiberar(p.id)} title="Liberar pieza">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Asignar pieza → GET /piezas/stock + PATCH /maniquies/:id/asignar-pieza */}
          <div className="form-group">
            <label>Asignar desde stock</label>
            {piezasStock.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No hay piezas libres en el depósito.</p>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select value={piezaAsignar} onChange={e => setPiezaAsignar(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Seleccioná una pieza...</option>
                  {piezasStock.map(p => (
                    <option key={p.id} value={p.id}> #{p.id} — {nombreCatalogo(p.id_catalogo)} ({p.material} / {p.color}) </option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleAsignar}>Asignar</button>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline" onClick={cerrar}>Cerrar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
