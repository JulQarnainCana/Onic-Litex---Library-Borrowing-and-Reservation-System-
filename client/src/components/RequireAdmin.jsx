import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/catalog" replace />;
  }

  return <Outlet />;
}
