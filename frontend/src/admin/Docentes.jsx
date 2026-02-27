import { useState, useEffect } from "react";
import axios from "axios";
import DocenteModal from "../components/DocenteModal";

export default function Docentes() {
  const [busqueda, setBusqueda] = useState("");
  const [docentes, setDocentes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoDocente, setNuevoDocente] = useState({
    nombre: "",
    correo: "",
    especialidad: "",
  });

  useEffect(() => {
    obtenerDocentes();
  }, []);

  const obtenerDocentes = () => {
    axios
      .get("http://localhost:3000/docentes")
      .then((res) => setDocentes(res.data))
      .catch((err) => console.error(err));
  };
  

  const crearDocente = async () => {
    try {
      await axios.post("http://localhost:3000/docentes", nuevoDocente);
      setMostrarModal(false);
      setNuevoDocente({ nombre: "", correo: "", especialidad: "" });
      obtenerDocentes(); // refresca tabla
    } catch (error) {
      console.error("Error al crear docente:", error);
    }
  };

  const docentesFiltrados = docentes.filter((doc) =>
    doc.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Gestión de Docentes</h1>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Buscar docente..."
          className="border rounded-lg px-4 py-2 w-1/3"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button
          onClick={() => setMostrarModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg" >
          + Nuevo Docente
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            <tr>
              <th className="px-6 py-4">Docente</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Especialidad</th>
            </tr>
          </thead>
          <tbody>
            {docentesFiltrados.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="px-6 py-4">{doc.nombre}</td>
                <td className="px-6 py-4">{doc.correo}</td>
                <td className="px-6 py-4">{doc.especialidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <DocenteModal
          onClose={() => setMostrarModal(false)}
          onSuccess={obtenerDocentes}
        />
      )}
    </div>
  );
}