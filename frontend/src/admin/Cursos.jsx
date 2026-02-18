export default function Cursos() {
  const cursos = [
    { id: 1, nombre: "React desde Cero", alumnos: 45 },
    { id: 2, nombre: "Marketing Digital", alumnos: 32 },
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Gestión de Cursos
      </h2>

      <div className="bg-white rounded-xl shadow p-6">

        <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded">
          + Nuevo Curso
        </button>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Nombre</th>
              <th>Alumnos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map(curso => (
              <tr key={curso.id} className="border-b">
                <td className="py-3">{curso.nombre}</td>
                <td>{curso.alumnos}</td>
                <td className="space-x-2">
                  <button className="text-blue-600">Editar</button>
                  <button className="text-red-600">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  )
}
