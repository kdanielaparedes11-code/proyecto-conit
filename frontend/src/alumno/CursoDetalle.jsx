import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api";

export default function CursoDetalle() {
  const { id } = useParams()

  const [curso, setCurso] = useState(null)
  const [moduloAbierta, setModuloAbierta] = useState(null)
  const [progreso, setProgreso] = useState(0)

  const [respuestasExamen, setRespuestasExamen] = useState({})
  const [examenActivo, setExamenActivo] = useState(null)
  const [tiempoRestante, setTiempoRestante] = useState(0)

  const [intentos, setIntentos] = useState({})

  /* ========================= */
  /* CARGAR CURSO */
  /* ========================= */
  useEffect(() => {
    async function cargarCurso() {
      try {
        const idalumno = localStorage.getItem("idalumno");

        const res = await api.get(
          `/curso/alumno/${idalumno}/curso/${id}`
        );

        setCurso(res.data)

      } catch (err) {
        console.log("Error cargando curso", err)
      }
    }
    cargarCurso()
  }, [id])

  /* ========================= */
  /* TIMER */
  /* ========================= */
  useEffect(() => {
    if (!examenActivo) return

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          alert("⏳ Tiempo terminado")
          setExamenActivo(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examenActivo])

  /* ========================= */
  /* INICIAR EXAMEN */
  /* ========================= */
  const iniciarExamen = async (ex) => {
    const idalumno = localStorage.getItem("idalumno");

    try {
      await api.post(`/examen/${ex.id}/iniciar`, {
        idAlumno: idalumno,
      });

      setExamenActivo(ex)
      setTiempoRestante((ex.duracion_minutos || 30) * 60)

    } catch (err) {
      alert("❌ Ya no tienes intentos disponibles")
    }
  }

  /* ========================= */
  /* RESPUESTAS */
  /* ========================= */
  const seleccionarRespuestaExamen = (preguntaId, opcionId) => {
    setRespuestasExamen((prev) => ({
      ...prev,
      [preguntaId]: opcionId,
    }))
  }

  /* ========================= */
  /* ENVIAR EXAMEN */
  /* ========================= */
  const enviarExamen = async (examen) => {
    const idalumno = localStorage.getItem("idalumno");

    const respuestas = {}

    examen.preguntas.forEach((p) => {
      if (respuestasExamen[p.id]) {
        respuestas[p.id] = respuestasExamen[p.id]
      }
    })

    try {
      await api.post(`/examen/${ex.id}/responder`, {
        respuestas,
        idAlumno: localStorage.getItem("idalumno")

      })

      alert(`🎯 Nota: ${res.data.nota}`)

      setIntentos((prev) => ({
        ...prev,
        [examen.id]: (prev[examen.id] || 0) + 1
      }))

      setExamenActivo(null)
      setRespuestasExamen({})

    } catch (err) {
      alert("Error al enviar examen")
    }
  }

  if (!curso) return <div className="p-10">Cargando...</div>

  const modulos = curso.modulos || []

  /* ========================= */
  /* VISTA EXAMEN FULL */
  /* ========================= */
  if (examenActivo) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">

        {/* HEADER */}
        <div className="bg-white shadow rounded-xl p-4 mb-6 flex justify-between items-center">
          <button
            onClick={() => setExamenActivo(null)}
            className="text-sm text-gray-500 hover:underline"
          >
            ← Volver al curso
          </button>

          <div className="text-right">
            <p className="text-xs text-gray-400">Tiempo</p>
            <p className="text-xl font-bold text-indigo-600">
              {String(Math.floor(tiempoRestante / 60)).padStart(2, '0')}:
              {String(tiempoRestante % 60).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* PREGUNTAS */}
        <div className="space-y-5">
          {examenActivo.preguntas?.map((p, index) => (
            <div key={p.id} className="bg-white p-5 rounded-xl shadow">
              <p className="font-semibold mb-3">
                {index + 1}. {p.enunciado}
              </p>

              {p.opciones?.map((op) => (
                <label
                  key={op.id}
                  className={`block border rounded p-2 mb-2 cursor-pointer ${
                    respuestasExamen[p.id] == op.id
                      ? "bg-indigo-100 border-indigo-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name={`p-${p.id}`}
                    onChange={() =>
                      seleccionarRespuestaExamen(p.id, op.id)
                    }
                  />
                  <span className="ml-2">{op.texto}</span>
                </label>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={() => enviarExamen(examenActivo)}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
        >
          🚀 Enviar examen
        </button>
      </div>
    )
  }

  /* ========================= */
  /* VISTA CURSO */
  /* ========================= */
  return (
    <div className="w-full px-10 py-8">

      {/* HEADER */}
      <div className="bg-indigo-600 text-white p-6 rounded-lg mb-8">
        <h1 className="text-2xl font-bold">{curso.nombrecurso}</h1>
        <p>{curso.descripcion}</p>
      </div>

      <div className="grid grid-cols-4 gap-8">

        {/* CONTENIDO */}
        <div className="col-span-3 space-y-4">

          {modulos.map((modulo) => (
            <div key={modulo.id} className="border rounded-xl bg-white shadow">

              {/* HEADER MODULO */}
              <button
                onClick={() =>
                  setModuloAbierta(moduloAbierta === modulo.id ? null : modulo.id)
                }
                className="w-full flex justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-t-xl"
              >
                <span className="font-semibold text-lg">
                  📦 {modulo.titulo}
                </span>
                <span>{moduloAbierta === modulo.id ? "▲" : "▼"}</span>
              </button>

              {/* CONTENIDO */}
              {moduloAbierta === modulo.id && (
                <div className="p-5 space-y-6">

                  {modulo.lecciones?.map((leccion) => (
                    <div key={leccion.id} className="bg-gray-50 p-4 rounded-xl border">

                      <h4 className="font-semibold text-md mb-3">
                        📘 {leccion.titulo}
                      </h4>

                      {/* VIDEOS */}
                      {leccion.materiales?.map((m) =>
                        m.tipo === "video" ? (
                          <iframe
                            key={m.id}
                            src={m.embed_url || `https://player.vimeo.com/video/${m.vimeo_video_id}`}
                            className="w-full rounded mb-4"
                            height="350"
                          />
                        ) : null
                      )}

                      {/* ARCHIVOS */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {leccion.materiales?.map((m) =>
                          m.tipo === "archivo" ? (
                            <a
                              key={m.id}
                              href={m.archivo_url}
                              target="_blank"
                              className="bg-white border px-3 py-2 rounded hover:bg-gray-100"
                            >
                              📄 {m.titulo}
                            </a>
                          ) : null
                        )}
                      </div>

                      {/* EXÁMENES */}
                      {leccion.examenes?.length > 0 && (
                        <div className="space-y-3">
                          {leccion.examenes.map((ex) => {
                            const usados = intentos[ex.id] || 0
                            const bloqueado = usados >= ex.intentos_permitidos

                            return (
                              <div key={ex.id} className="border p-4 rounded-lg bg-white shadow-sm">

                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-semibold">🧪 {ex.titulo}</p>
                                    <p className="text-sm text-gray-500">
                                      ⏱ {ex.duracion_minutos} min
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Intentos: {usados}/{ex.intentos_permitidos}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => iniciarExamen(ex)}
                                    disabled={bloqueado}
                                    className={`px-4 py-2 rounded ${
                                      bloqueado
                                        ? "bg-gray-400"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                                  >
                                    {bloqueado ? "Bloqueado" : "Rendir"}
                                  </button>
                                </div>

                              </div>
                            )
                          })}
                        </div>
                      )}

                    </div>
                  ))}

                </div>
              )}
            </div>
          ))}

        </div>

        {/* SIDEBAR */}
        <div className="col-span-1">
          <div className="bg-white border rounded-lg p-5 shadow">
            <h3 className="font-semibold mb-3">Progreso</h3>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${progreso}%` }}
              />
            </div>

            <p className="text-sm mt-2">{progreso}% completado</p>
          </div>
        </div>

      </div>
    </div>
  )
}