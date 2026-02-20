import { useState } from "react";
import axios from "axios";

export default function DocenteModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    telefono: "",
    direccion: "",
    correo: "",
    numDocumento: "",
    crearUsuario: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:3000/docentes", formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear docente:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 animate-fadeIn">
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Registrar Nuevo Docente
        </h2>

        {/* GRID FORM */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-gray-600">Nombre</label>
            <input
              name="nombre"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Apellido</label>
            <input
              name="apellido"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Tipo de Documento</label>
            <select
              name="tipoDocumento"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              value={formData.tipoDocumento}
            >
              <option value="DNI">DNI</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Carnet Extranjería">Carnet Extranjería</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">N° Documento</label>
            <input
              name="numDocumento"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Teléfono</label>
            <input
              name="telefono"
              type="number"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Correo</label>
            <input
              name="correo"
              type="email"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">Dirección</label>
            <input
              name="direccion"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-span-2 flex items-center gap-3 mt-4">
            <input
                type="checkbox"
                name="crearUsuario"
                checked={formData.crearUsuario || false}
                onChange={(e) =>
                setFormData({
                    ...formData,
                    crearUsuario: e.target.checked,
                })
                }
                className="w-4 h-4"
            />
            <label className="text-gray-700 font-medium">
                ¿Asignar usuario al docente?
            </label>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
          >
            Guardar Docente
          </button>
        </div>
      </div>
    </div>
  );
}