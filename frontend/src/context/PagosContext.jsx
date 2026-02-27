import { createContext, useContext, useState } from "react"

const PagosContext = createContext()

export function PagosProvider({ children }) {
  const [pagos, setPagos] = useState([])

  const agregarPago = (curso) => {
    const nuevoPago = {
      id: Date.now(),
      curso: curso.nombre,
      descripcion: "Matrícula",
      monto: curso.precio,
      estado: "Pendiente",
      fecha: null
    }

    setPagos(prev => [...prev, nuevoPago])
  }

  const confirmarPago = (id) => {
    setPagos(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, estado: "Pagado", fecha: new Date().toLocaleDateString() }
          : p
      )
    )
  }

  return (
    <PagosContext.Provider value={{ pagos, agregarPago, confirmarPago }}>
      {children}
    </PagosContext.Provider>
  )
}

export const usePagos = () => useContext(PagosContext)
