export default function HomePage() {
  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-40 rounded-xl flex items-center px-8 text-white text-xl font-semibold">
        Bienvenido a tu Aula Virtual
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card title="Cursos Activos" value="3" />
        <Card title="Sesiones" value="12" />
        <Card title="Certificados" value="1" />
      </div>
    </>
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
