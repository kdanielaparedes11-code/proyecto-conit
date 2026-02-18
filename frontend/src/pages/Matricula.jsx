import { useState } from "react"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { usePagos } from "../context/PagosContext"


export default function Matricula() {
  const [selectedCurso, setSelectedCurso] = useState(null)
  const [matriculados, setMatriculados] = useState([])

    const navigate = useNavigate()
    const { agregarPago } = usePagos()


  const cursos = [
    {
      id: 1,
      nombre: "Ingeniería de Software",
      descripcion: "Desarrollo profesional en aplicaciones modernas.",
      precio: "S/ 850"
    },
    {
      id: 2,
      nombre: "Marketing Digital Estratégico",
      descripcion: "Estrategias digitales orientadas a resultados.",
      precio: "S/ 650"
    },
    {
      id: 3,
      nombre: "Gestión Empresarial",
      descripcion: "Formación integral en administración moderna.",
      precio: "S/ 700"
    }
  ]

  const confirmarMatricula = () => {
  agregarPago(selectedCurso)
  setSelectedCurso(null)
  navigate("/mis-pagos")
    }

  return (
    <div>

      <h1 className="text-2xl font-semibold mb-8 text-slate-800">
        Proceso de Matrícula
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {cursos.map(curso => {
          const yaMatriculado = matriculados.includes(curso.id)

          return (
            <div
              key={curso.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition"
            >
              <h2 className="text-lg font-bold text-slate-800">
                {curso.nombre}
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {curso.descripcion}
              </p>

              <p className="mt-4 text-indigo-600 font-semibold">
                {curso.precio}
              </p>

              <button
                disabled={yaMatriculado}
                onClick={() => setSelectedCurso(curso)}
                className={`mt-6 w-full py-2 rounded-lg text-sm transition ${
                  yaMatriculado
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {yaMatriculado ? "Matriculado" : "Matricularme"}
              </button>
            </div>
          )
        })}

      </div>

      {/* MODAL */}
      {selectedCurso && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-8 w-96 relative">

            <button
              onClick={() => setSelectedCurso(null)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X size={18}/>
            </button>

            <h2 className="text-xl font-bold mb-4">
              Confirmar Matrícula
            </h2>

            <p className="text-gray-600 text-sm">
              Estás a punto de matricularte en:
            </p>

            <p className="mt-2 font-semibold text-slate-800">
              {selectedCurso.nombre}
            </p>

            <p className="mt-2 text-indigo-600 font-bold">
              {selectedCurso.precio}
            </p>

            <button
              onClick={confirmarMatricula}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
            >
              Confirmar
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
