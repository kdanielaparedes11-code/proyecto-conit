export default function Pagos() {
  const pagos = [
    { id: 1, usuario: "Ana Torres", curso: "React", estado: "Pagado" },
    { id: 2, usuario: "Luis Pérez", curso: "Marketing", estado: "Pendiente" },
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Gestión de Pagos
      </h2>

      <div className="bg-white rounded-xl shadow p-6">

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Usuario</th>
              <th>Curso</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map(pago => (
              <tr key={pago.id} className="border-b">
                <td className="py-3">{pago.usuario}</td>
                <td>{pago.curso}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${
                    pago.estado === "Pagado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {pago.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  )
}
