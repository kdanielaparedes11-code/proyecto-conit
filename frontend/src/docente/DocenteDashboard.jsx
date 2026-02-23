export default function DocenteDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Card title="Cursos a Dictar" value="4" /> 
        <Card title="Alumnos por Evaluar" value="25" />
        <Card title="Próxima Clase" value="10:00 AM" />
        <Card title="Estado de Notas" value="Pendiente" />

      </div>

      {/* Sección extra para avisos o pendientes rápidos */}
      <div className="mt-10 bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-blue-700 font-medium">
          Recordatorio: Tienes 4 registros de notas pendientes por cerrar esta semana.
        </p>
      </div>
      
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
