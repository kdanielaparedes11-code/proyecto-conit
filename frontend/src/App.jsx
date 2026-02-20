import { Routes, Route } from "react-router-dom"

import LayoutEstudiante from "./layouts/LayoutEstudiante"
import HomePage from "./pages/HomePage"
import MisCursos from "./pages/MisCursos"
import MisSesiones from "./pages/MisSesiones"
import MisCertificados from "./pages/MisCertificados"
import Biblioteca from "./pages/Biblioteca"
import MiPerfil from "./pages/MiPerfil"
import MisPagos from "./pages/MisPagos"

import AdminLayout from "./admin/AdminLayout"
import Dashboard from "./admin/Dashboard"
import Docentes from "./admin/docentes"
import Cursos from "./admin/Cursos"
import Alumnos from "./admin/alumnos"
import Usuarios from "./admin/Usuarios"
import Pagos from "./admin/Pagos"

import Matricula from "./pages/Matricula"


export default function App() {
  return (
    <Routes>

      {/* ESTUDIANTE */}
      <Route path="/" element={<LayoutEstudiante />}>
        <Route index element={<HomePage />} />
        <Route path="mis-cursos" element={<MisCursos />} />
        <Route path="mis-sesiones" element={<MisSesiones />} />
        <Route path="mis-certificados" element={<MisCertificados />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="mi-perfil" element={<MiPerfil />} />
        <Route path="mis-pagos" element={<MisPagos />} />
        <Route path="matricula" element={<Matricula />} />

      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="docentes" element={<Docentes />} />
        <Route path="cursos" element={<Cursos />} />
        <Route path="alumnos" element={<Alumnos />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="pagos" element={<Pagos />} />
      </Route>

    </Routes>
  )
}
