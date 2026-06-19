import { useState, useEffect } from 'react'
import Modal from '../components/Modal.jsx'
import Dropdown from '../components/Dropdown.jsx'
import {
  getManiquies, getManiquiById,
  createManiqui, updateManiqui, deleteManiqui,
  cambiarEstado, asignarPieza, liberarPieza,
  getPiezasStock, getCatalogo, getModelos
} from '../api/index.js'

const ESTADOS    = ['Pendiente', 'En proceso', 'Ensamblado']
const MATERIALES = ['Plástico', 'Fibra', 'Madera', 'Metal']
const COLORES    = ['Blanco', 'Negro', 'Gris', 'Piel', 'Caoba', 'Cromado']

const opc = (arr) => arr.map(x => ({ value: x, label: x }))

const badgeEstado = (e) => {
  if (e === 'Pendiente')  return 'badge-pendiente'
  if (e === 'En proceso') return 'badge-proceso'
  if (e === 'Ensamblado') return 'badge-terminado'
  return ''
}

export default function Maniquies() {
  const [maniquies,    setManiquies]    = useState([])
  const [catalogo,     setCatalogo]     = useState([])
  const [modelos,      setModelos]      = useState([])
  const [piezasStock,  setPiezasStock]  = useState([])
  const [error,        setError]        = useState(null)
  const [modal,        setModal]        = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [aEliminar,    setAEliminar]    = useState(null)
  const [detalle,      setDetalle]      = useState(null)
  const [form,         setForm]         = useState({ id_modelo: '', material: '', color: '' })
  const [formError,    setFormError]    = useState(null)
  const [nuevoEstado,  setNuevoEstado]  = useState('')
  const [piezaAsignar, setPiezaAsignar] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [cat, mod] = await Promise.all([getCatalogo(), getModelos()])
        setCatalogo(cat)
        setModelos(mod)
      } catch (e) {
        setError('No se pudo cargar catálogo o modelos desde el backend.')
      }
    }
    cargarDatos()
  }, [])

  const cargar = async () => {
    try {
      setError(null)
      const m = await getManiquies()
      setManiquies(m)
      const stock = await getPiezasStock()
      setPiezasStock(stock)
    } catch {
      setError('No se pudo conectar al backend. ¿Está corriendo en localhost:3000?')
    }
  }

  useEffect(() => { cargar() }, [])

  const cerrar = () => {
    setModal(null); setSeleccionado(null); setDetalle(null); setFormError(null); setAEliminar(null)
  }

  const setCampo = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }))

  const nombreCatalogo = (id) =>
    catalogo.find(c => c.id === Number(id))?.descripcion ?? `Catálogo #${id}`

  // ── Crear ──
  const abrirCrear = () => {
    setForm({ id_modelo: '', material: '', color: '' })
    setFormError(null)
    setModal('crear')
  }

  // ── Editar ──
  const abrirEditar = (m) => {
    setForm({ id_modelo: m.id_modelo, material: m.material, color: m.color })
    setSeleccionado(m)
    setFormError(null)
    setModal('editar')
  }

  const handleSubmitForm = async () => {
    setFormError(null)
    if (modal === 'crear' && !form.id_modelo) {
      setFormError('Seleccioná un modelo de maniquí.')
      return
    }
    if (!form.material || !form.color) {
      setFormError('Completá todos los campos antes de continuar.')
      return
    }
    try {
      if (modal === 'crear') {
        await createManiqui({
          id_modelo: Number(form.id_modelo),
          material: form.material,
          color: form.color
        })
      } else {
        await updateManiqui(seleccionado.id, { ...seleccionado, ...form })
      }
      cerrar(); cargar()
    } catch (e) { setFormError(e.message) }
  }

  // ── Eliminar ──
  const abrirEliminar = (m) => {
    setAEliminar(m)
    setModal('eliminar')
  }

  const confirmarEliminar = async () => {
    try {
      await deleteManiqui(aEliminar.id)
      cerrar(); cargar()
    } catch (e) { setFormError(e.message) }
  }

  // ── Estado ──
  const abrirEstado = (m) => {
    setSeleccionado(m)
    setNuevoEstado(m.estado)
    setModal('estado')
  }

  const handleCambiarEstado = async () => {
    try {
      await cambiarEstado(seleccionado.id, nuevoEstado)
      cerrar(); cargar()
    } catch (e) {
      setError(e.message)
      setTimeout(() => setError(null), 4000)
    }
  }

  // ── Piezas ──
  const abrirPiezas = async (m) => {
    setSeleccionado(m)
    setPiezaAsignar('')
    setModal('piezas')
    try {
      const data = await getManiquiById(m.id)
      setDetalle(data)
    } catch (e) {
      setError(e.message)
      setTimeout(() => setError(null), 4000)
    }
  }

  const recargarDetalle = async () => {
    const data = await getManiquiById(seleccionado.id)
    setDetalle(data)
    const stock = await getPiezasStock()
    setPiezasStock(stock)
  }

  const handleAsignar = async () => {
    if (!piezaAsignar) { setError('Seleccioná una pieza'); setTimeout(() => setError(null), 3000); return }
    try {
      await asignarPieza(seleccionado.id, Number(piezaAsignar))
      setPiezaAsignar('')
      recargarDetalle()
    } catch (e) {
      setError(e.message)
      setTimeout(() => setError(null), 4000)
    }
  }

  const handleLiberar = async (id_pieza) => {
    try {
      await liberarPieza(seleccionado.id, id_pieza)
      recargarDetalle()
    } catch (e) {
      setError(e.message)
      setTimeout(() => setError(null), 4000)
    }
  }

  const pendientes = maniquies.filter(m => m.estado === 'Pendiente').length
  const enProceso  = maniquies.filter(m => m.estado === 'En proceso').length
  const terminados = maniquies.filter(m => m.estado === 'Ensamblado').length

  // Opciones para los dropdowns
  const opcionesModelos = modelos.map(m => ({ value: m.id, label: `${m.nombre_modelo} (${m.linea_producto})` }))
  const opcionesStock = piezasStock.map(p => ({
    value: p.id,
    label: `#${p.id} — ${p.descripcion || nombreCatalogo(p.id_catalogo)} (${p.material} / ${p.color})`
  }))

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
        <div className="stat"><div className="stat-value">{terminados}</div><div className="stat-label">Ensamblados</div></div>
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
                <th>Modelo</th>
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
                  <td>{m.nombre_modelo}</td>
                  <td>{m.material}</td>
                  <td>{m.color}</td>
                  <td>
                    <span className={`badge ${badgeEstado(m.estado)}`}>{m.estado}</span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => abrirPiezas(m)}>
                      🔩 Ver piezas
                    </button>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => abrirEstado(m)}>Estado</button>
                      <button className="btn btn-outline btn-sm" onClick={() => abrirEditar(m)}>Editar</button>
                      <button className="btn btn-danger btn-sm"  onClick={() => abrirEliminar(m)}>Eliminar</button>
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
          {formError && (
            <div className="error-banner" style={{ marginBottom: '1rem' }}>⚠ {formError}</div>
          )}
          <div className="form-group">
            <label>Modelo de maniquí</label>
            <Dropdown
              value={form.id_modelo}
              onChange={(v) => setCampo('id_modelo', v)}
              options={opcionesModelos}
              placeholder="Seleccioná..."
              disabled={modal === 'editar'}
            />
          </div>
          <div className="form-group">
            <label>Material</label>
            <Dropdown
              value={form.material}
              onChange={(v) => setCampo('material', v)}
              options={opc(MATERIALES)}
              placeholder="Seleccioná..."
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <Dropdown
              value={form.color}
              onChange={(v) => setCampo('color', v)}
              options={opc(COLORES)}
              placeholder="Seleccioná..."
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={cerrar}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmitForm}>
              {modal === 'crear' ? 'Crear orden' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Confirmar Eliminar ── */}
      {modal === 'eliminar' && aEliminar && (
        <Modal title="ELIMINAR MANIQUÍ" onClose={cerrar}>
          {formError && (
            <div className="error-banner" style={{ marginBottom: '1rem' }}>⚠ {formError}</div>
          )}
          <p style={{ marginBottom: '1.5rem' }}>
            ¿Seguro que querés eliminar el maniquí <strong>#{aEliminar.id}</strong>
            {' '}({aEliminar.nombre_modelo} · {aEliminar.material} · {aEliminar.color})?
            Sus piezas asignadas volverán al depósito. Esta acción no se puede deshacer.
          </p>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={cerrar}>Cancelar</button>
            <button className="btn btn-danger" onClick={confirmarEliminar}>Sí, eliminar</button>
          </div>
        </Modal>
      )}

      {/* ── Modal Estado ── */}
      {modal === 'estado' && seleccionado && (
        <Modal title="CAMBIAR ESTADO" onClose={cerrar}>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Maniquí #{seleccionado.id} · {seleccionado.material} {seleccionado.color}
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
                  ...(e === 'Ensamblado' ? { background: 'rgba(74,222,128,0.15)',  color: 'var(--success)' } : {}),
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

          <label>Piezas asignadas</label>
          {!detalle ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.5rem 0 1rem' }}>Cargando...</p>
          ) : detalle.piezas?.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0.5rem 0 1rem' }}>Sin piezas asignadas.</p>
          ) : (
            <div className="piezas-list" style={{ marginBottom: '1.25rem' }}>
              {detalle.piezas?.map(p => (
                <div key={p.id} className="pieza-chip">
                  #{p.id} · {p.descripcion || nombreCatalogo(p.id_catalogo)} · {p.material} · {p.color}
                  <button onClick={() => handleLiberar(p.id)} title="Liberar pieza">✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Asignar desde stock</label>
            {piezasStock.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No hay piezas libres en el depósito.</p>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Dropdown
                    value={piezaAsignar}
                    onChange={setPiezaAsignar}
                    options={opcionesStock}
                    placeholder="Seleccioná una pieza..."
                  />
                </div>
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
