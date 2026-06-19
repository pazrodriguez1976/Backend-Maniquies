import { useState, useRef, useEffect } from 'react'

/**
 * Dropdown personalizado que reemplaza al <select> nativo.
 * Permite estilar las opciones (el <select> nativo no deja).
 *
 * Props:
 *  - value: valor seleccionado actual
 *  - onChange: función que recibe el nuevo valor
 *  - options: array de { value, label }
 *  - placeholder: texto cuando no hay nada elegido
 *  - disabled: deshabilita el dropdown
 */
export default function Dropdown({ value, onChange, options, placeholder = 'Seleccioná...', disabled = false }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  // Cierra el dropdown si hacés clic afuera
  useEffect(() => {
    const handleClickAfuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickAfuera)
    return () => document.removeEventListener('mousedown', handleClickAfuera)
  }, [])

  // Busca la etiqueta de la opción seleccionada
  const seleccionada = options.find(o => String(o.value) === String(value))
  const textoMostrado = seleccionada ? seleccionada.label : placeholder

  const elegir = (opcionValue) => {
    onChange(opcionValue)
    setAbierto(false)
  }

  return (
    <div className="dropdown" ref={ref}>
      {/* Botón principal que muestra la selección actual */}
      <button
        type="button"
        className={`dropdown-trigger ${disabled ? 'dropdown-disabled' : ''}`}
        onClick={() => !disabled && setAbierto(!abierto)}
        disabled={disabled}
      >
        <span className={seleccionada ? '' : 'dropdown-placeholder'}>
          {textoMostrado}
        </span>
        <span className={`dropdown-arrow ${abierto ? 'abierto' : ''}`}>▾</span>
      </button>

      {/* Lista de opciones desplegada */}
      {abierto && (
        <ul className="dropdown-menu">
          {options.map(o => (
            <li
              key={o.value}
              className={`dropdown-option ${String(o.value) === String(value) ? 'seleccionada' : ''}`}
              onClick={() => elegir(o.value)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
