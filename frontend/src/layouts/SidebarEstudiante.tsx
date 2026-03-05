import { BookOpen, FileText, Award, CreditCard, User } from "lucide-react";

const SidebarEstudiante = () => {
  return (
    <div className="w-64 h-screen bg-blue-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-8">Aula Virtual</h2>

      <ul className="space-y-5">
        <li className="flex items-center gap-3 cursor-pointer">
          <BookOpen size={20} /> Mis Cursos
        </li>
        <li className="flex items-center gap-3 cursor-pointer">
          <FileText size={20} /> Evaluaciones
        </li>
        <li className="flex items-center gap-3 cursor-pointer">
          <Award size={20} /> Notas
        </li>
        <li className="flex items-center gap-3 cursor-pointer">
          <CreditCard size={20} /> Pagos
        </li>
        <li className="flex items-center gap-3 cursor-pointer">
          <User size={20} /> Perfil
        </li>
      </ul>
    </div>
  );
};

export default SidebarEstudiante;
