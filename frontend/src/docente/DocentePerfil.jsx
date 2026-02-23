import { useState } from "react";

export default function DocentePerfil() {
  const [editando, setEditando] = useState(false);

  const [datos, setDatos] = useState({
    nombre: "Treisy",
    apellido: "Becerra Muñoz",
    tipoDocumento: "DNI",
    numDocumento: "77889900",
    telefono: "955123456",
    direccion: "Av. Universitaria, Cajamarca",
    correo: "trey01@aula-virtual.edu",
  });

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const guardarCambios = () => {
    setEditando(false);
    // Aquí luego conectarás con backend
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">

        {/* Cabecera */}
        <div className="bg-blue-950 h-24"></div>

        <div className="p-8 -mt-16 text-center">

          {/* Foto con iniciales */}
          <div className="w-32 h-32 bg-blue-600 rounded-full border-4 border-white mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold shadow-sm">
            {datos.nombre[0]}{datos.apellido[0]}
          </div>

          <h2 className="text-3xl font-bold text-gray-800">
            {datos.nombre} {datos.apellido}
          </h2>
          <p className="text-blue-600 font-medium">Docente de la Institución</p>

          {/* Información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-10 text-left border-t pt-8">

            <CampoEditable
              label="Nombre"
              name="nombre"
              value={datos.nombre}
              editando={editando}
              onChange={manejarCambio}
            />

            <CampoEditable
              label="Apellido"
              name="apellido"
              value={datos.apellido}
              editando={editando}
              onChange={manejarCambio}
            />

            <CampoEditable
              label="Correo Electrónico"
              name="correo"
              value={datos.correo}
              editando={editando}
              onChange={manejarCambio}
            />

            <CampoEditable
              label="Teléfono"
              name="telefono"
              value={datos.telefono}
              editando={editando}
              onChange={manejarCambio}
            />

            <CampoEditable
              label={datos.tipoDocumento}
              name="numDocumento"
              value={datos.numDocumento}
              editando={editando}
              onChange={manejarCambio}
            />

            <div className="md:col-span-2">
              <CampoEditable
                label="Dirección"
                name="direccion"
                value={datos.direccion}
                editando={editando}
                onChange={manejarCambio}
              />
            </div>

          </div>

          {/* Botones */}
          <div className="mt-10 flex justify-center gap-4">
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="bg-slate-800 text-white px-8 py-2 rounded hover:bg-slate-700 transition font-semibold"
              >
                Editar Perfil
              </button>
            ) : (
              <>
                <button
                  onClick={guardarCambios}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => setEditando(false)}
                  className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* 🔹 Componente reutilizable */
function CampoEditable({ label, name, value, editando, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </label>

      {editando ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border p-2 rounded"
        />
      ) : (
        <p className="text-gray-700 text-lg border-b border-gray-100 pb-1">
          {value}
        </p>
      )}
    </div>
  );
}