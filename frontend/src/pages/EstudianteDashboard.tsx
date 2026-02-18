import DashboardLayout from "../layouts/DashboardLayout";

const EstudianteDashboard = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Bienvenido, Estudiante 👋</h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Cursos Activos</h3>
          <p className="text-2xl font-bold">5</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Evaluaciones Pendientes</h3>
          <p className="text-2xl font-bold">2</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Promedio General</h3>
          <p className="text-2xl font-bold">18.4</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">Certificados</h3>
          <p className="text-2xl font-bold">1</p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default EstudianteDashboard;
