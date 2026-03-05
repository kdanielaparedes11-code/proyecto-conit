import { useState } from "react";

export default function Alumnos() {
  const [busqueda, setBusqueda] = useState("");

  const alumnos = [
    {
      id: 1,
      nombre: "Carlos Sabogal",
      email: "carlos@conit.edu",
      especialidad: "Matemática",
    },
    {
      id: 2,
      nombre: "María López",
      email: "maria@conit.edu",
      especialidad: "Física",
    },
  ];

  const alumnosFiltrados = alumnos.filter((doc) =>
    doc.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Gestión de Alumnos</h1>

      {/* Barra superior */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Buscar alumno..."
          className="border rounded-lg px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          + Nuevo Alumno
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            <tr>
              <th className="px-6 py-4">Alumno</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Especialidad</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {alumnosFiltrados.map((doc) => (
              <tr key={doc.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <span className="font-medium">{doc.nombre}</span>
                </td>

                <td className="px-6 py-4">{doc.email}</td>
                <td className="px-6 py-4">{doc.especialidad}</td>

                <td className="px-6 py-4 text-center space-x-3">
                  <button className="text-blue-600 hover:underline">
                    Editar
                  </button>
                  <button className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                  <button className="text-gray-600 hover:underline">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {alumnosFiltrados.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron alumnos.
          </div>
        )}
      </div>
    </div>
  );
}
