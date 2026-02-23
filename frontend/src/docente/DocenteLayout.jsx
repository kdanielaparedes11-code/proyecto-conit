import { Home, BookOpen, FileText, Library, LifeBuoy } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import DocenteMenu from "../components/DocenteMenu"

export default function DocenteLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <aside className="w-64 bg-slate-900 text-white flex flex-col p-8">

        <h1 className="text-2xl font-bold mb-10">
          CONIT
        </h1>

        <nav className="space-y-6 text-lg">

          <Link to="/docente" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <Home size={20}/>
            Principal
          </Link>

          <Link to="/docente/docente-cursos" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <BookOpen size={20}/>
            Mis Cursos
          </Link>

          <Link to="/docente/docente-notas" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <FileText size={20}/>
            Registro de Notas
          </Link>

          <Link to="/docente/docente-resultados" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <FileText size={20}/>
            Resultados Académicos
          </Link>

          <Link to="/docente/docente-horario" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <Library size={20}/>
            Mi Horario
          </Link>

        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
      
              <header className="h-16 bg-white shadow flex items-center justify-between px-8">
                <h2 className="text-lg font-semibold">
                  Aula Virtual Docente
                </h2>
      
                <DocenteMenu />
              </header>
      
              <main className="flex-1 overflow-auto p-8">
                <Outlet />
              </main>
      
            </div>
      
            <Toaster position="top-right" />

    </div>
  )
}
