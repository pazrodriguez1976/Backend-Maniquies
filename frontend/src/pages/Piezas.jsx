import { useState, useEffect } from 'react'
import Modal from '../components/Modal.jsx'
import Dropdown from '../components/Dropdown.jsx'
import { getPiezas, getPiezasStock, createPieza, updatePieza, deletePieza, getCatalogo } from '../api/index.js'

const MATERIALES = ['Plástico', 'Fibra', 'Madera', 'Metal']
const COLORES    = ['Blanco', 'Negro', 'Gris', 'Piel', 'Caoba', 'Cromado']

// Helper: convierte un array de strings en opciones {value, label}
const opc = (arr) => arr.map(x => ({ value: x, label: x }))

export default function Piezas() {
  const [piezas,     setPiezas]     = useState([])
  const [catalogo,   setCatalogo]   = useState([])
  const [stockCount, setStockCount] = useState(0)
  const [error,      setError]      = useState(null)
  const [modal,      setModal]      = useState(null)
  const [editando,   setEditando]   = useState(null)
  const [aEliminar,  setAEliminar]  = useState(null)
  const [form, setForm] = useState({ id_catalogo: '', material: '', color: '' })
  const [formError, setFormError] = useState(null)

  const [filtroMat, setFiltroMat] = useState('')
  const [filtroCol, setFiltroCol] = useState('')
  const [filtroEst, setFiltroEst] = useState('')

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const data = await getCatalogo()
        setCatalogo(data)
      } catch (e) {
        setError('No se pudo cargar el catálogo desde el backend.')
      }
    }
    cargarCatalogo()
  }, [])

  const cargar = async () => {
    try {
      setError(null)
      const data = await getPiezas({ material: filtroMat, color: filtroCol })
      const filtradas = filtroEst
        ? data.filter(p => (filtroEst === 'libre' ? p.id_maniqui === null : p.id_maniqui !== null))
        : data
      setPiezas(filtradas)

      const stock = await getPiezasStock()
      setStockCount(stock.length)
    } catch (e) {
      setError('No se pudo conectar al backend. ¿Está corriendo en localhost:3000?')
    }
  }

  useEffect(() => { cargar() }, [filtroMat, filtroCol, filtroEst])

  const cerrar = () => { setModal(null); setEditando(null); setAEliminar(null); setFormError(null) }

  const abrirCrear = () => {
    setForm({ id_catalogo: '', material: '', color: '' })
    setFormError(null)
    setModal('crear')
  }

  const abrirEditar = (p) => {
    setForm({ id_catalogo: p.id_catalogo, material: p.material, color: p.color })
    setEditando(p)
    setFormError(null)
    setModal('editar')
  }

  const abrirEliminar = (p) => {
    if (p.id_maniqui !== null) {
      setError('No se puede eliminar una pieza asignada a un maniquí. Primero liberala.')
      setTimeout(() => setError(null), 4000)
      return
    }
    setAEliminar(p)
    setModal('eliminar')
  }

  // Para el Dropdown: actualiza un campo del form
  const setCampo = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }))

  const handleSubmit = async () => {
    setFormError(null)
    if (!form.id_catalogo || !form.material || !form.color) {
      setFormError('Completá todos los campos antes de continuar.')
      return
    }
    try {
      if (modal === 'crear') {
        await createPieza({
          id_catalogo: Number(form.id_catalogo),
          material: form.material,
          color: form.color
        })
      } else {
        await updatePieza(editando.id, { material: form.material, color: form.color })
      }
      cerrar()
      cargar()
    } catch (e) {
      setFormError(e.message)
    }
  }

  const confirmarEliminar = async () => {
    try {
      await deletePieza(aEliminar.id)
      cerrar()
      cargar()
    } catch (e) {
      setFormError(e.message)
    }
  }

  const nombreCatalogo = (id) =>
    catalogo.find(c => c.id === Number(id))?.descripcion ?? `Catálogo #${id}`

  const asignadas = piezas.filter(p => p.id_maniqui !== null).length

  // Opciones del catálogo para el Dropdown
  const opcionesCatalogo = catalogo.map(c => ({ value: c.id, label: c.descripcion }))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">PIEZAS</h1>
          <p className="page-subtitle">Inventario físico del depósito</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nueva Pieza</button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-value">{piezas.length}</div>
          <div className="stat-label">Mostrando</div>
        </div>
        <div className="stat">
          <div className="stat-value">{stockCount}</div>
          <div className="stat-label">En stock</div>
        </div>
        <div className="stat">
          <div className="stat-value">{asignadas}</div>
          <div className="stat-label">Asignadas</div>
        </div>
      </div>

      {/* Filtros con Dropdown */}
      <div className="filters">
        <div style={{ minWidth: 170 }}>
          <Dropdown
            value={filtroMat}
            onChange={setFiltroMat}
            options={[{ value: '', label: 'Todos los materiales' }, ...opc(MATERIALES)]}
            placeholder="Todos los materiales"
          />
        </div>
        <div style={{ minWidth: 170 }}>
          <Dropdown
            value={filtroCol}
            onChange={setFiltroCol}
            options={[{ value: '', label: 'Todos los colores' }, ...opc(COLORES)]}
            placeholder="Todos los colores"
          />
        </div>
        <div style={{ minWidth: 170 }}>
          <Dropdown
            value={filtroEst}
            onChange={setFiltroEst}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'libre', label: 'Libre' },
              { value: 'asignada', label: 'Asignada' },
            ]}
            placeholder="Todos los estados"
          />
        </div>
        {(filtroMat || filtroCol || filtroEst) && (
          <button className="btn btn-outline btn-sm"
            onClick={() => { setFiltroMat(''); setFiltroCol(''); setFiltroEst('') }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      {piezas.length === 0 && !error ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <p>No hay piezas que coincidan.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Catálogo</th>
                <th>Material</th>
                <th>Color</th>
                <th>Estado</th>
                <th>Maniquí</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {piezas.map(p => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--muted)' }}>{p.id}</td>
                  <td>{p.descripcion || nombreCatalogo(p.id_catalogo)}</td>
                  <td>{p.material}</td>
                  <td>{p.color}</td>
                  <td>
                    <span className={`badge ${p.id_maniqui === null ? 'badge-libre' : 'badge-asignada'}`}>
                      {p.id_maniqui === null ? 'Libre' : 'Asignada'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>
                    {p.id_maniqui ? `#${p.id_maniqui}` : '—'}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => abrirEliminar(p)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal title={modal === 'crear' ? 'NUEVA PIEZA' : 'EDITAR PIEZA'} onClose={cerrar}>
          {formError && (
            <div className="error-banner" style={{ marginBottom: '1rem' }}>⚠ {formError}</div>
          )}

          <div className="form-group">
            <label>Tipo de pieza (catálogo)</label>
            <Dropdown
              value={form.id_catalogo}
              onChange={(v) => setCampo('id_catalogo', v)}
              options={opcionesCatalogo}
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
            <button className="btn btn-primary" onClick={handleSubmit}>
              {modal === 'crear' ? 'Crear pieza' : 'Guardar cambios'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar Eliminar */}
      {modal === 'eliminar' && aEliminar && (
        <Modal title="ELIMINAR PIEZA" onClose={cerrar}>
          {formError && (
            <div className="error-banner" style={{ marginBottom: '1rem' }}>⚠ {formError}</div>
          )}
          <p style={{ marginBottom: '1.5rem' }}>
            ¿Seguro que querés eliminar la pieza <strong>#{aEliminar.id}</strong>
            {' '}({aEliminar.descripcion || nombreCatalogo(aEliminar.id_catalogo)})?
            Esta acción no se puede deshacer.
          </p>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={cerrar}>Cancelar</button>
            <button className="btn btn-danger" onClick={confirmarEliminar}>Sí, eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
