import { useEffect, useMemo, useRef, useState } from "react"
import { getCursosDocente, getAlumnosByCurso } from "../services/docenteService"

function ListaAprobados() {
  const [cursos, setCursos] = useState([])
  const [query, setQuery] = useState("")
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null)
  const [openSug, setOpenSug] = useState(false)

  const [alumnos, setAlumnos] = useState([])
  const [filtro, setFiltro] = useState("APROBADOS") // APROBADOS | RECUPERACION | DESAPROBADOS

  // Modal nota adicional
  const [modalOpen, setModalOpen] = useState(false)
  const [alumnoModal, setAlumnoModal] = useState(null)
  const [notaAdicional, setNotaAdicional] = useState("")
  const [descAdicional, setDescAdicional] = useState("EXAMEN ADICIONAL")

  const wrapperRef = useRef(null)

  useEffect(() => {
    getCursosDocente().then(setCursos)
  }, [])

  // Cargar alumnos cuando elijo curso
  useEffect(() => {
    if (!cursoSeleccionado?.id) {
      setAlumnos([])
      return
    }
    getAlumnosByCurso(cursoSeleccionado.id).then(setAlumnos)
  }, [cursoSeleccionado])

  // Cerrar sugerencias al click fuera
  useEffect(() => {
    const onClick = (e) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target)) setOpenSug(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // === Sugerencias tipo Google ===
  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return cursos
      .filter((c) => c.nombre.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, cursos])

  // === Listado visible de cursos (se filtra en tiempo real) ===
  const cursosVisibles = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cursos
    return cursos.filter((c) => c.nombre.toLowerCase().includes(q))
  }, [query, cursos])

  const elegirCurso = (c) => {
    setCursoSeleccionado(c)
    setQuery(c.nombre)
    setOpenSug(false)
  }

  const limpiarCurso = () => {
    setCursoSeleccionado(null)
    setQuery("")
    setOpenSug(false)
    setAlumnos([])
  }

  // === Lógica de estado por alumno ===
  const promedioAlumno = (a) => {
    const n1 = Number(a.nota1 ?? 0)
    const n2 = Number(a.nota2 ?? 0)
    const n3 = Number(a.nota3 ?? 0)
    const base = (n1 + n2 + n3) / 3
    const extra = a.notaAdicional != null ? Number(a.notaAdicional) : null
    return extra != null ? Math.max(base, extra) : base
  }

  const estadoAlumno = (a) => {
    const prom = promedioAlumno(a)
    if (prom >= 11) return "APROBADOS"
    if (prom >= 8) return "RECUPERACION"
    return "DESAPROBADOS"
  }

  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter((a) => estadoAlumno(a) === filtro)
  }, [alumnos, filtro])

  // === Modal registro adicional ===
  const abrirModal = (a) => {
    setAlumnoModal(a)
    setNotaAdicional(a.notaAdicional ?? "")
    setDescAdicional(a.descAdicional?.trim() ? a.descAdicional : "EXAMEN ADICIONAL")
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setAlumnoModal(null)
    setNotaAdicional("")
    setDescAdicional("EXAMEN ADICIONAL")
  }

  const guardarNotaAdicional = () => {
    if (!alumnoModal) return
    const n = notaAdicional === "" ? null : Number(notaAdicional)
    if (n != null && (Number.isNaN(n) || n < 0 || n > 20)) {
      alert("La nota debe estar entre 0 y 20.")
      return
    }

    setAlumnos((prev) =>
      prev.map((x) =>
        x.id === alumnoModal.id
          ? { ...x, notaAdicional: n, descAdicional: descAdicional || "EXAMEN ADICIONAL" }
          : x
      )
    )

    cerrarModal()
    alert("Nota adicional guardada (mock).")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold">Lista de aprobados</h2>
        <p className="text-sm text-gray-500">
          Busca un curso, selecciónalo y gestiona aprobados/recuperación/desaprobados.
        </p>
      </div>

      {/* Buscador + listado visible de cursos */}
      <div className="bg-white p-4 rounded shadow space-y-4" ref={wrapperRef}>
        <div>
          <label className="block font-semibold mb-2">Buscar curso</label>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpenSug(true)
                setCursoSeleccionado(null) // si escribe, invalida selección previa
              }}
              onFocus={() => setOpenSug(true)}
              placeholder="Escribe el nombre del curso..."
              className="border rounded px-3 py-2 w-full"
            />

            {query && (
              <button
                type="button"
                onClick={limpiarCurso}
                className="absolute right-2 top-2 text-sm text-gray-500 hover:text-gray-800"
                title="Limpiar"
              >
                ✕
              </button>
            )}

            {openSug && sugerencias.length > 0 && (
              <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow overflow-hidden">
                {sugerencias.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => elegirCurso(c)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="font-semibold">{c.nombre}</div>
                    <div className="text-xs text-gray-500">
                      Grupo {c.grupo} • {c.horario}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista visible de cursos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Cursos del docente</h3>
            <span className="text-sm text-gray-500">
              {cursosVisibles.length} curso(s)
            </span>
          </div>

          {cursosVisibles.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cursosVisibles.map((c) => {
                const activo = cursoSeleccionado?.id === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => elegirCurso(c)}
                    className={`text-left border rounded p-3 hover:bg-gray-50 ${
                      activo ? "border-blue-600 bg-blue-50" : ""
                    }`}
                  >
                    <div className="font-semibold">{c.nombre}</div>
                    <div className="text-sm text-gray-600">
                      Grupo {c.grupo} • {c.horario}
                    </div>
                    {activo && (
                      <div className="text-xs mt-2 text-blue-700 font-semibold">
                        Seleccionado
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">No se encontraron cursos con ese filtro.</p>
          )}
        </div>

        {/* Detalle curso seleccionado */}
        {cursoSeleccionado && (
          <div className="border rounded p-3 bg-gray-50">
            <div className="font-semibold">{cursoSeleccionado.nombre}</div>
            <div className="text-sm text-gray-600">
              Grupo {cursoSeleccionado.grupo} • {cursoSeleccionado.horario}
            </div>
          </div>
        )}
      </div>

      {/* Filtro y tabla */}
      {cursoSeleccionado && (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h3 className="text-lg font-bold">Alumnos</h3>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtro:</span>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="APROBADOS">Aprobados</option>
                <option value="RECUPERACION">Por recuperación</option>
                <option value="DESAPROBADOS">Desaprobados</option>
              </select>
            </div>
          </div>

          {alumnosFiltrados.length === 0 ? (
            <p className="text-gray-500">No hay alumnos para este filtro.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[800px] w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Alumno</th>
                    <th className="py-2 text-left">Notas</th>
                    <th className="py-2 text-left">Promedio</th>
                    <th className="py-2 text-left">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {alumnosFiltrados.map((a) => {
                    const prom = promedioAlumno(a).toFixed(1)

                    return (
                      <tr key={a.id} className="border-b">
                        <td className="py-2">{a.nombre}</td>

                        <td className="py-2 text-sm text-gray-700">
                          N1: {a.nota1 ?? "-"} • N2: {a.nota2 ?? "-"} • N3: {a.nota3 ?? "-"}
                          {a.notaAdicional != null && (
                            <div className="text-xs text-gray-500 mt-1">
                              Adicional: {a.notaAdicional} ({a.descAdicional || "EXAMEN ADICIONAL"})
                            </div>
                          )}
                        </td>

                        <td className="py-2 font-semibold">{prom}</td>

                        <td className="py-2">
                          {filtro === "RECUPERACION" ? (
                            <button
                              type="button"
                              onClick={() => abrirModal(a)}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
                            >
                              Registrar nota
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded shadow p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Registro de nota adicional</h3>
                <p className="text-sm text-gray-500">{alumnoModal?.nombre}</p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold mb-2">Nota adicional (0-20)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={notaAdicional}
                  onChange={(e) => setNotaAdicional(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Ej: 14"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Descripción</label>
                <input
                  value={descAdicional}
                  onChange={(e) => setDescAdicional(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Sugerido: EXAMEN ADICIONAL</p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="border px-3 py-2 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarNotaAdicional}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListaAprobados