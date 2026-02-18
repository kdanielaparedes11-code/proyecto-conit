import { useState, useMemo } from "react"
import { ArrowUpDown } from "lucide-react"

export default function MisSesiones() {

  const sesiones = [
    { fecha: "2030-05-07", hora: "07:00", usuario: "Eduardo" },
    { fecha: "2030-05-07", hora: "13:00", usuario: "Paula" },
    { fecha: "2030-05-14", hora: "09:30", usuario: "Carlos" },
    { fecha: "2030-05-14", hora: "15:00", usuario: "Lucía" },
    { fecha: "2030-05-21", hora: "10:00", usuario: "María" },
    { fecha: "2030-05-22", hora: "11:00", usuario: "José" },
    { fecha: "2030-05-23", hora: "08:00", usuario: "Ana" },
  ]

  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [ordenAsc, setOrdenAsc] = useState(true)
  const [pagina, setPagina] = useState(1)

  const porPagina = 4

  // Filtrar
  const filtradas = useMemo(() => {
    return sesiones.filter(s => {
      const fecha = new Date(s.fecha)
      const d = desde ? new Date(desde) : null
      const h = hasta ? new Date(hasta) : null

      if (d && fecha < d) return false
      if (h && fecha > h) return false
      return true
    })
  }, [desde, hasta])

  // Ordenar
  const ordenadas = useMemo(() => {
    return [...filtradas].sort((a, b) =>
      ordenAsc
        ? new Date(a.fecha) - new Date(b.fecha)
        : new Date(b.fecha) - new Date(a.fecha)
    )
  }, [filtradas, ordenAsc])

  const totalPaginas = Math.ceil(ordenadas.length / porPagina)

  const datosPagina = ordenadas.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  )

  return (
    <div className="h-full flex flex-col gap-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Mis sesiones
        </h1>

        <div className="flex gap-4">

          <input
            type="date"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value)
              setPagina(1)
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value)
              setPagina(1)
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>
      </div>

      {/* CARD TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* CABECERA */}
        <div className="grid grid-cols-3 px-6 py-4 text-sm font-medium text-gray-500 border-b border-gray-200 bg-gray-50">

          <button
            onClick={() => setOrdenAsc(!ordenAsc)}
            className="flex items-center gap-2 hover:text-gray-800 transition"
          >
            Fecha
            <ArrowUpDown size={16} />
          </button>

          <div>Hora</div>
          <div>Usuario</div>

        </div>

        {/* FILAS */}
        <div className="divide-y divide-gray-100">

          {datosPagina.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-3 px-6 py-4 text-sm hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-700">
                {formatearFecha(s.fecha)}
              </div>

              <div className="text-gray-600">{s.hora}</div>

              <div className="text-gray-800">{s.usuario}</div>
            </div>
          ))}

          {datosPagina.length === 0 && (
            <div className="px-6 py-10 text-center text-gray-400">
              No hay sesiones en este rango
            </div>
          )}

        </div>
      </div>

      {/* PAGINACIÓN SaaS */}
      <div className="flex items-center justify-between">

        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-600">
          Página {pagina} de {totalPaginas || 1}
        </span>

        <button
          disabled={pagina === totalPaginas || totalPaginas === 0}
          onClick={() => setPagina(pagina + 1)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm disabled:opacity-40 hover:bg-gray-50 transition"
        >
          Siguiente
        </button>

      </div>
    </div>
  )
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
