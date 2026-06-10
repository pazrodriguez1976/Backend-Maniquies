import { useState, useEffect } from 'react'
import Modal from '../components/Modal.jsx'
import { getPiezas, getPiezasStock, createPieza, updatePieza, deletePieza } from '../api/index.js'

// Datos del catálogo hardcodeados — en el backend están en db.js (arrays en memoria)
// Cuando se conecte MySQL, esto podría venir de un GET /catalogo
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
]

const MATERIALES = ['Plástico', 'Fibra', 'Madera', 'Metal']
const COLORES    = ['Blanco', 'Negro', 'Gris', 'Beige', 'Rojo']

export default function Piezas() {
  const [piezas,    setPiezas]    = useState([])
  const [stockCount, setStockCount] = useState(0)
  const [error,     setError]     = useState(null)
  const [modal,     setModal]     = useState(null)  // null | 'crear' | 'editar'
  const [editando,  setEditando]  = useState(null)
  const [form, setForm] = useState({ id_catalogo: '', material: '', color: '' })

  // Filtros (usa query params del backend GET /piezas?material=X&color=Y)
  const [filtroMat, setFiltroMat] = useState('')
  const [filtroCol, setFiltroCol] = useState('')
  const [filtroEst, setFiltroEst] = useState('')

  const cargar = async () => {
    try {
      setError(null)
      // Llama a GET /piezas con filtros opcionales
      const data = await getPiezas({ material: filtroMat, color: filtroCol })
      // Filtra por estado localmente ya que el back no tiene ese query param
      const filtradas = filtroEst
        ? data.filter(p => (filtroEst === 'libre' ? p.id_maniqui === null : p.id_maniqui !== null))
        : data
      setPiezas(filtradas)

      // Llama a GET /piezas/stock para contar las libres
      const stock = await getPiezasStock()
      setStockCount(stock.length)
    } catch (e) {
      setError('No se pudo conectar al backend. ¿Está corriendo en localhost:3000?')
    }
  }

  useEffect(() => { cargar() }, [filtroMat, filtroCol, filtroEst])

  const cerrar = () => { setModal(null); setEditando(null) }

  const abrirCrear = () => {
    setForm({ id_catalogo: '', material: '', color: '' })
    setModal('crear')
  }

  const abrirEditar = (p) => {
    setForm({ id_catalogo: p.id_catalogo, material: p.material, color: p.color })
    setEditando(p)
    setModal('editar')
  }

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.id_catalogo || !form.material || !form.color) {
      alert('Completá todos los campos')
      return
    }
    try {
      if (modal === 'crear') {
        // POST /piezas  → el backend setea id_maniqui: null automáticamente
        await createPieza({
          id_catalogo: Number(form.id_catalogo),
          material: form.material,
          color: form.color
        })
      } else {
        // PUT /piezas/:id  → el backend actualiza material y color
        await updatePieza(editando.id, { material: form.material, color: form.color })
      }
      cerrar()
      cargar()
    } catch (e) {
      alert(`Error: ${e.message}`)
    }
  }

  const handleEliminar = async (p) => {
    if (p.id_maniqui !== null) {
      alert('El backend no permite eliminar piezas asignadas a un maniquí.')
      return
    }
    if (!confirm(`¿Eliminar pieza #${p.id}?`)) return
    try {
      // DELETE /piezas/:id
      await deletePieza(p.id)
      cargar()
    } catch (e) {
      alert(`Error: ${e.message}`)
    }
  }

  const nombreCatalogo = (id) =>
    CATALOGO.find(c => c.id === Number(id))?.descripcion ?? `Catálogo #${id}`

  const asignadas = piezas.filter(p => p.id_maniqui !== null).length

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

      {/* Filtros → se mandan como query params al backend */}
      <div className="filters">
        <select value={filtroMat} onChange={e => setFiltroMat(e.target.value)}>
          <option value="">Todos los materiales</option>
          {MATERIALES.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filtroCol} onChange={e => setFiltroCol(e.target.value)}>
          <option value="">Todos los colores</option>
          {COLORES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filtroEst} onChange={e => setFiltroEst(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="libre">Libre</option>
          <option value="asignada">Asignada</option>
        </select>
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
                  <td>{nombreCatalogo(p.id_catalogo)}</td>
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
                      <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(p)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {modal && (
        <Modal title={modal === 'crear' ? 'NUEVA PIEZA' : 'EDITAR PIEZA'} onClose={cerrar}>
          <div className="form-group">
            <label>Tipo de pieza (catálogo)</label>
            <select name="id_catalogo" value={form.id_catalogo} onChange={handleChange} disabled={modal === 'editar'}>
              <option value="">Seleccioná...</option>
              {CATALOGO.map(c => <option key={c.id} value={c.id}>{c.descripcion}</option>)}
            </select>
          </div>
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
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
             
            </p>
          )}
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={cerrar}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {modal === 'crear' ? 'Crear pieza' : 'Guardar cambios'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
