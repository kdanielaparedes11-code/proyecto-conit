import { useState } from "react";

export default function DocenteResultados() {
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(false);
  const [tipoModal, setTipoModal] = useState(""); // normal o adicional
  const [alumnoActual, setAlumnoActual] = useState(null);
  const [notaNueva, setNotaNueva] = useState("");

  const [alumnos, setAlumnos] = useState([
    { id: 1, nombre: "Carlos Ramos", notas: [10, 9] },
    { id: 2, nombre: "María López", notas: [15, 18] },
    { id: 3, nombre: "Luis Torres", notas: [6, 7] },
  ]);

  const calcularPromedio = (notas) =>
    notas.reduce((a, b) => a + b, 0) / notas.length;

  const obtenerEstado = (promedio) => {
    if (promedio >= 11) return "aprobado";
    if (promedio >= 8) return "recuperacion";
    return "desaprobado";
  };

  const alumnosFiltrados = alumnos.filter((alumno) => {
    if (filtro === "todos") return true;
    const promedio = calcularPromedio(alumno.notas);
    return obtenerEstado(promedio) === filtro;
  });

  const abrirModal = (alumno, tipo) => {
    setAlumnoActual(alumno);
    setTipoModal(tipo);
    setNotaNueva("");
    setModal(true);
  };

  const guardarNota = () => {
    if (!notaNueva) return;

    const copia = [...alumnos];
    const index = copia.findIndex(
      (a) => a.id === alumnoActual.id
    );

    copia[index].notas.push(Number(notaNueva));
    setAlumnos(copia); // 🔥 se actualiza inmediatamente

    setModal(false);
  };

  return (
    <div className="flex justify-center bg-gray-50 min-h-screen p-10">
      <div className="w-full max-w-5xl">

        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
          Resultados Académicos
        </h2>

        {/* FILTRO */}
        <div className="mb-6 text-center">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border p-2 rounded w-64"
          >
            <option value="todos">Todos</option>
            <option value="aprobado">Aprobados</option>
            <option value="recuperacion">Recuperación</option>
            <option value="desaprobado">Desaprobados</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <table className="w-full border">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="p-3">Alumno</th>
                <th className="p-3">Notas</th>
                <th className="p-3">Promedio</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {alumnosFiltrados.map((alumno) => {
                const promedio = calcularPromedio(alumno.notas);
                const estado = obtenerEstado(promedio);

                return (
                  <tr key={alumno.id} className="border-t">
                    <td className="p-3">{alumno.nombre}</td>

                    <td className="p-3 text-center">
                      {alumno.notas.join(", ")}
                    </td>

                    <td className="p-3 text-center">
                      {promedio.toFixed(2)}
                    </td>

                    <td className="p-3 text-center">
                      {estado === "aprobado" && (
                        <span className="text-green-600 font-bold">
                          Aprobado
                        </span>
                      )}
                      {estado === "recuperacion" && (
                        <span className="text-orange-500 font-bold">
                          Recuperación
                        </span>
                      )}
                      {estado === "desaprobado" && (
                        <span className="text-red-600 font-bold">
                          Desaprobado
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center space-x-2">
                      {/* Registrar Nota Normal */}
                      <button
                        onClick={() =>
                          abrirModal(alumno, "normal")
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Registrar Nota
                      </button>

                      {/* Examen Adicional */}
                      <button
                        onClick={() =>
                          abrirModal(alumno, "adicional")
                        }
                        className="bg-purple-600 text-white px-3 py-1 rounded"
                      >
                        Examen Adicional
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setModal(false)}
            ></div>

            <div className="relative bg-white p-6 rounded-xl w-96 shadow-xl">
              <h3 className="text-xl font-semibold mb-4">
                {tipoModal === "adicional"
                  ? "Examen Adicional"
                  : "Registrar Nota"}
              </h3>

              <p className="mb-2 font-medium">
                {alumnoActual?.nombre}
              </p>

              <input
                type="number"
                min="0"
                max="20"
                value={notaNueva}
                onChange={(e) =>
                  setNotaNueva(e.target.value)
                }
                className="w-full border p-2 rounded mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>

                <button
                  onClick={guardarNota}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}