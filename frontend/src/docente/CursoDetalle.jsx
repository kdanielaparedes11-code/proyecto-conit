import { useParams } from "react-router-dom";
import { useState } from "react";

export default function CursoDetalle() {
  const { id } = useParams();

  const [modal, setModal] = useState(null);

  const [alumnos, setAlumnos] = useState([
    { id: 1, nombre: "Carlos Ramos", estado: "ausente" },
    { id: 2, nombre: "Ana Torres", estado: "ausente" },
    { id: 3, nombre: "Luis García", estado: "ausente" }
  ]);

  const [archivos, setArchivos] = useState([]);
  const eliminarArchivo = (indexEliminar) => {
    setArchivos(
      archivos.filter((_, index) => index !== indexEliminar)
    );
  };

  const editarArchivo = (indexEditar) => {
    const nuevoNombre = prompt("Nuevo nombre del archivo:");
    if (!nuevoNombre) return;

    const copia = [...archivos];
    copia[indexEditar] = nuevoNombre;
    setArchivos(copia);
  };
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);



  const cambiarEstado = (idAlumno, nuevoEstado) => {
    setAlumnos(
      alumnos.map((alumno) =>
        alumno.id === idAlumno
          ? { ...alumno, estado: nuevoEstado }
          : alumno
      )
    );
  };

  const colorEstado = (estado) => {
    if (estado === "presente") return "bg-green-500 text-white";
    if (estado === "tardanza") return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Curso ID: {id}</h2>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Alumno</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.id} className="border-t">
                <td className="p-3">{alumno.nombre}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${colorEstado(
                      alumno.estado
                    )}`}
                  >
                    {alumno.estado}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() =>
                      cambiarEstado(alumno.id, "presente")
                    }
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    P
                  </button>

                  <button
                    onClick={() =>
                      cambiarEstado(alumno.id, "tardanza")
                    }
                    className="bg-orange-500 text-white px-2 py-1 rounded"
                  >
                    T
                  </button>

                  <button
                    onClick={() =>
                      cambiarEstado(alumno.id, "ausente")
                    }
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    A
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* CONTENIDO DEL CURSO */}
<div className="mt-10 bg-white p-6 rounded-xl shadow border">
  <h3 className="text-xl font-semibold mb-4">
    Contenido del Curso
  </h3>

  {archivos.length === 0 ? (
    <p className="text-gray-500">
      No hay archivos subidos todavía.
    </p>
  ) : (
    <ul className="space-y-3">

      {archivos.map((archivo, index) => (
        <li
          key={index}
          className="p-3 border rounded flex justify-between items-center"
        >
         <span>{archivo}</span>

         <div className="flex gap-2">
         <button
           onClick={() => editarArchivo(index)}
           className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
         >
          Editar
         </button>

      <button
        onClick={() => eliminarArchivo(index)}
        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
      >
        Eliminar
      </button>
    </div>
  </li>
))}

    </ul>
  )}
</div>




      {/* BOTONES */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => setModal("archivo")}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Subir Archivo Clase
        </button>

        <button
          onClick={() => setModal("silabo")}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Subir Sílabo
        </button>
      </div>

      {/* MODAL */}
      {modal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    
    {/* Fondo oscuro */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setModal(null)}
    ></div>

    {/* Contenido del modal */}
    <div className="relative bg-white p-6 rounded-2xl w-96 shadow-2xl">
      <h3 className="text-xl font-semibold mb-4">
        {modal === "archivo"
          ? "Subir Archivo de Clase"
          : "Subir Sílabo"}
      </h3>


      <input
        type="file"
        onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
        className="mb-4 w-full border p-2 rounded"
     />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setModal(null)}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancelar
        </button>


        <button
          onClick={() => {
            if (archivoSeleccionado) {
              setArchivos([...archivos, archivoSeleccionado.name]);
            }
            setArchivoSeleccionado(null);
            setModal(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
         Subir
        </button>



      </div>
    </div>
  </div>
)}
    </div>
  );
}