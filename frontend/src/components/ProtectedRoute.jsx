import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    const token = localStorage.getItem("token");
    //Si no hay token, redirige al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    //Si hay token, renderiza el componente protegido
    return <Outlet />;
}