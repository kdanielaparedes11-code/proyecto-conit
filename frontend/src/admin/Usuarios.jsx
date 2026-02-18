export default function Usuarios() {
  const usuarios = [
    { id: 1, nombre: "Ana Torres", email: "ana@email.com" },
    { id: 2, nombre: "Luis Pérez", email: "luis@email.com" },
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Gestión de Usuarios
      </h2>

      <div className="bg-white rounded-xl shadow p-6">

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Nombre</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id} className="border-b">
                <td className="py-3">{user.nombre}</td>
                <td>{user.email}</td>
                <td>
                  <button className="text-red-600">
                    Bloquear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  )
}
