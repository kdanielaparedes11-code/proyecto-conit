import { useState } from "react";

export default function DocenteHorario() {

  const [horario] = useState([
    { dia: "Lunes", curso: "Matemática", grupo: "A-101", hora: "8:00 - 10:00" },
    { dia: "Martes", curso: "Programación", grupo: "Lab-2", hora: "10:00 - 12:00" },
    { dia: "Miércoles", curso: "Base de Datos", grupo: "A-203", hora: "2:00 - 4:00" },
    { dia: "Jueves", curso: "Programación", grupo: "Lab-2", hora: "8:00 - 10:00" },
    { dia: "Viernes", curso: "Matemática", grupo: "A-101", hora: "10:00 - 12:00" },
  ]);

  return (
    <div className="flex justify-center bg-gray-50 min-h-screen p-10">
      <div className="w-full max-w-5xl">

        <h2 className="text-3xl font-bold text-blue-900 text-center mb-8">
          Mi Horario
        </h2>

        <div className="bg-white shadow-xl rounded-xl p-6">

          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="p-4">Día</th>
                <th className="p-4">Curso</th>
                <th className="p-4">Grupo</th>
                <th className="p-4">Horario</th>
              </tr>
            </thead>

            <tbody>
              {horario.map((item, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-100 transition"
                >
                  <td className="p-4 font-semibold text-center">
                    {item.dia}
                  </td>

                  <td className="p-4 text-center">
                    {item.curso}
                  </td>

                  <td className="p-4 text-center">
                    {item.grupo}
                  </td>

                  <td className="p-4 text-center text-blue-700 font-medium">
                    {item.hora}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}