import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function DashboardLayout() {
  const { theme } = useAuth();
  const location = useLocation();
  const isAdminShell = location.pathname.startsWith("/admin");
  const themeClass = theme === "dark" ? "theme-dark" : "";

  return (
    <div className={`dashboard-layout ${themeClass}`}>
      {isAdminShell ? <AdminSidebar /> : <Sidebar />}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
