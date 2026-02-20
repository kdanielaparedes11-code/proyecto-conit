import { Home, BookOpen, FileText, Library, LifeBuoy } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Toaster } from "react-hot-toast"

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <aside className="w-64 bg-slate-900 text-white flex flex-col p-8">

        <h1 className="text-2xl font-bold mb-10">
          CONIT
        </h1>

        <nav className="space-y-6 text-lg">

          <Link to="/admin" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <Home size={20}/>
            Principal
          </Link>

          <Link to="/admin/docentes" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <BookOpen size={20}/>
            Docentes
          </Link>

          <Link to="/admin/cursos" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <BookOpen size={20}/>
            Cursos
          </Link>

          <Link to="/admin/alumnos" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <FileText size={20}/>
            Alumno
          </Link>

          <Link to="/admin/mis-certificados" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <FileText size={20}/>
            Matrícula
          </Link>

          <Link to="/admin/biblioteca" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <Library size={20}/>
            Sesiones
          </Link>

          <div className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded cursor-pointer">
            <LifeBuoy size={20}/>
            Certificado
          </div>

        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
      
              <header className="h-16 bg-white shadow flex items-center justify-between px-8">
                <h2 className="text-lg font-semibold">
                  Aula Virtual
                </h2>
      
                <div> Karem</div>
              </header>
      
              <main className="flex-1 overflow-auto p-8">
                <Outlet />
              </main>
      
            </div>
      
            <Toaster position="top-right" />

    </div>
  )
}
