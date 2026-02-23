import { useNavigate } from "react-router-dom";

export default function DocenteCursos() {
  const navigate = useNavigate();

  const cursos = [
    {
      id: 1,
      nombre: "Programación Web",
      grupo: "A",
      horario: "Lunes 8:00 - 10:00",
      alumnos: 25,
      imagen: "img1.jpg"
    },
    {
      id: 2,
      nombre: "Base de Datos",
      grupo: "B",
      horario: "Miércoles 10:00 - 12:00",
      alumnos: 18,
      imagen: "img2.jpg"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Mis Cursos</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border"
          >
            <img
              src={curso.imagen}
              alt={curso.nombre}
              className="w-full h-40 object-cover"
            />

            <div className="p-6">
              <h3 className="text-xl font-semibold">
                {curso.nombre}
              </h3>

              <p className="text-gray-500 mt-2">Grupo: {curso.grupo}</p>
              <p className="text-gray-500">Horario: {curso.horario}</p>
              <p className="text-gray-500">Alumnos: {curso.alumnos}</p>

              <button
                onClick={() => navigate(`/docente/cursos/${curso.id}`)}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Ingresar al Curso
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}