import { useState } from "react";
import jsPDF from "jspdf";

export default function DocenteNotas() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [modal, setModal] = useState(false);
  const [alumnoActual, setAlumnoActual] = useState(null);
  const [notaTemporal, setNotaTemporal] = useState("");

  const cursos = [
    { id: 1, nombre: "Programación Web" },
    { id: 2, nombre: "Base de Datos" },
  ];

  const [alumnos, setAlumnos] = useState([
    { id: 1, nombre: "Carlos Ramos", notas: [] },
    { id: 2, nombre: "María López", notas: [] },
    { id: 3, nombre: "Luis Torres", notas: [] },
  ]);

  const abrirModal = (alumno) => {
    setAlumnoActual(alumno);
    setNotaTemporal("");
    setModal(true);
  };

  const guardarNota = () => {
    if (!notaTemporal) return;

    const copia = [...alumnos];
    const index = copia.findIndex(
      (a) => a.id === alumnoActual.id
    );

    copia[index].notas.push(Number(notaTemporal));
    setAlumnos(copia);
    setModal(false);
  };

  
  const generarPDF = (alumno) => {
  const doc = new jsPDF();

  // ===== ENCABEZADO =====
  doc.setFillColor(15, 23, 42); // azul oscuro
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("INSTITUCIÓN EDUCATIVA CONIT", 105, 18, {
    align: "center",
  });

  // Reset color
  doc.setTextColor(0, 0, 0);

  // ===== TITULO =====
  doc.setFontSize(16);
  doc.text("BOLETA DE NOTAS", 105, 45, {
    align: "center",
  });

  // ===== DATOS DEL ALUMNO =====
  doc.setFontSize(12);
  doc.text(`Alumno: ${alumno.nombre}`, 20, 65);
  doc.text(`Curso: ${cursoSeleccionado}`, 20, 75);
  doc.text(
    `Fecha: ${new Date().toLocaleDateString()}`,
    20,
    85
  );

  // ===== TABLA DE NOTAS =====
  let y = 105;

  doc.setFontSize(13);
  doc.text("Detalle de Notas:", 20, y);

  y += 10;

  doc.setFontSize(12);

  alumno.notas.forEach((nota, i) => {
    doc.text(`Evaluación ${i + 1}`, 25, y);
    doc.text(`${nota}`, 160, y);
    y += 10;
  });

  // ===== PROMEDIO =====
  if (alumno.notas.length > 0) {
    const promedio =
      alumno.notas.reduce((a, b) => a + b, 0) /
      alumno.notas.length;

    y += 5;

    doc.setDrawColor(0);
    doc.line(20, y, 190, y);

    y += 10;

    doc.setFontSize(14);
    doc.text(
      `Promedio Final: ${promedio.toFixed(2)}`,
      20,
      y
    );

    const estado =
      promedio >= 11 ? "APROBADO" : "DESAPROBADO";

    doc.setFontSize(16);

    if (promedio >= 11) {
      doc.setTextColor(0, 128, 0);
    } else {
      doc.setTextColor(200, 0, 0);
    }

    doc.text(estado, 150, y);
  }

  // ===== PIE DE PAGINA =====
  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.text(
    "Documento generado automáticamente por el Sistema Académico",
    105,
    285,
    { align: "center" }
  );

  doc.save(`Boleta_${alumno.nombre}.pdf`);
};






  
  return (
    <div className="flex justify-center bg-gray-50 min-h-screen p-10">
      <div className="w-full max-w-4xl">
        
        <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
          Registro de Notas
        </h2>

        {/* Selector Curso */}
        <div className="mb-6 text-center">
          <select
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
            className="border p-2 rounded w-64"
          >
            <option value="">-- Seleccione Curso --</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.nombre}>
                {curso.nombre}
              </option>
            ))}
          </select>
        </div>

        {cursoSeleccionado && (
          <div className="bg-white rounded-xl shadow p-6">
            <table className="w-full border">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="p-3">Alumno</th>
                  <th className="p-3">Notas</th>
                  <th className="p-3">Promedio</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {alumnos.map((alumno) => {
                  const promedio =
                    alumno.notas.length > 0
                      ? (
                          alumno.notas.reduce(
                            (a, b) => a + b,
                            0
                          ) / alumno.notas.length
                        ).toFixed(2)
                      : "-";

                  return (
                    <tr key={alumno.id} className="border-t">
                      <td className="p-3">
                        {alumno.nombre}
                      </td>

                      <td className="p-3 text-center">
                        {alumno.notas.length > 0
                          ? alumno.notas.join(", ")
                          : "-"}
                      </td>

                      <td className="p-3 text-center">
                        {promedio}
                      </td>

                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => abrirModal(alumno)}
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Registrar Nota
                        </button>

                        <button
                          onClick={() =>
                            generarPDF(alumno)
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Boleta PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setModal(false)}
            ></div>

            <div className="relative bg-white p-6 rounded-xl w-96 shadow-xl">
              <h3 className="text-xl font-semibold mb-4">
                Registrar Nota
              </h3>

              <p className="mb-2 font-medium">
                {alumnoActual?.nombre}
              </p>

              <input
                type="number"
                min="0"
                max="20"
                value={notaTemporal}
                onChange={(e) =>
                  setNotaTemporal(e.target.value)
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