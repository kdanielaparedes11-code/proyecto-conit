import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { getCursoById, getAlumnosByCurso } from "../services/docenteService"

function CursoDetalleDocente() {
  const { id } = useParams()

  const [curso, setCurso] = useState(null)
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)

  const [msgSilabo, setMsgSilabo] = useState("")
  const [msgArchivo, setMsgArchivo] = useState("")

  // refs para disparar el input oculto
  const silaboInputRef = useRef(null)
  const archivoInputRef = useRef(null)

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      const cursoData = await getCursoById(id)
      const alumnosData = await getAlumnosByCurso(id)

      setCurso(cursoData)
      setAlumnos(alumnosData)
      setLoading(false)
    }

    cargarDatos()
  }, [id])

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow text-gray-500">
        Cargando curso...
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="bg-white p-4 rounded shadow text-red-600">
        Curso no encontrado.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado del curso */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold">{curso.nombre}</h2>
        <p className="text-gray-600">
          Grupo {curso.grupo} • {curso.horario}
        </p>
      </div>

      {/* Subida de archivos */}
      <div className="bg-white p-6 rounded shadow space-y-8">
        {/* ================= SÍLABO ================= */}
        <div>
          <h3 className="font-bold text-lg mb-3">Cargar Sílabo</h3>

          <button
            type="button"
            onClick={() => silaboInputRef.current?.click()}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Cargar archivo
          </button>

          <input
            ref={silaboInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return

              console.log("Sílabo seleccionado:", file)

              // aquí luego irá el POST al backend
              setMsgSilabo(`✅ Archivo cargado: ${file.name}`)
            }}
          />

          {msgSilabo && (
            <p className="text-sm text-gray-700 mt-3">{msgSilabo}</p>
          )}
        </div>

        <hr />

        {/* ================= ARCHIVO DE CLASE ================= */}
        <div>
          <h3 className="font-bold text-lg mb-3">Cargar Archivo de Clase</h3>

          <button
            type="button"
            onClick={() => archivoInputRef.current?.click()}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Cargar archivo
          </button>

          <input
            ref={archivoInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return

              console.log("Archivo de clase seleccionado:", file)

              // aquí luego irá el POST al backend
              setMsgArchivo(`✅ Archivo cargado: ${file.name}`)
            }}
          />

          {msgArchivo && (
            <p className="text-sm text-gray-700 mt-3">{msgArchivo}</p>
          )}
        </div>
      </div>

      {/* ================= ASISTENCIA ================= */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Asistencia</h3>

        {alumnos.length === 0 ? (
          <p className="text-gray-500">No hay alumnos en este curso.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Alumno</th>
                  <th className="py-2">Presente</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="py-2">{a.nombre}</td>
                    <td className="py-2">
                      <input type="checkbox" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CursoDetalleDocente