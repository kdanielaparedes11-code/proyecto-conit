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

import DocenteDashboard from "./docente/DocenteDashboard"
import DocenteLayout from "./docente/DocenteLayout"
import DocentePerfil from "./docente/DocentePerfil"
import DocenteCursos from "./docente/DocenteCursos"
import CursoDetalle from "./docente/CursoDetalle"
import DocenteNotas from "./docente/DocenteNotas"
import DocenteResultados from "./docente/DocenteResultados"
import DocenteHorario from "./docente/DocenteHorario"


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

      {/*DOCENTE */}
      <Route path="/docente" element={<DocenteLayout />}>
        <Route index element={<DocenteDashboard />} />
        <Route path="docente-perfil" element={<DocentePerfil />} />
        <Route path="docente-cursos" element={<DocenteCursos />} />
        <Route path="cursos/:id" element={<CursoDetalle />} />
        <Route path="docente-notas" element={<DocenteNotas />} />
        <Route path="docente-resultados" element={<DocenteResultados />} />
        <Route path="docente-horario" element={<DocenteHorario />} />
        
      </Route>

    </Routes>
  )
}
