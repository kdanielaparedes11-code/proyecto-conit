import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

import LayoutEstudiante from "./layouts/LayoutEstudiante";
import HomePage from "./pages/HomePage";
import MisCursos from "./pages/MisCursos";
import MisSesiones from "./pages/MisSesiones";
import MisCertificados from "./pages/MisCertificados";
import Biblioteca from "./pages/Biblioteca";
import MiPerfil from "./pages/MiPerfil";
import MisPagos from "./pages/MisPagos";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Docentes from "./admin/docentes";
import Cursos from "./admin/Cursos";
import Alumnos from "./admin/alumnos";
import Usuarios from "./admin/Usuarios";
import Pagos from "./admin/Pagos";

import Matricula from "./pages/Matricula";

export default function App() {
  return (
    <>
      {/*Muestra alertas de notificaciones*/}
      <Toaster position="top-right" />

      <Routes>
        {/*Login*/}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
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
        </Route>
      </Routes>
    </>
  );
}
