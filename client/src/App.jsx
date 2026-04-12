import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import Books from "./pages/Books";
import Reservations from "./pages/user/Reservations";
import MyLoans from "./pages/user/MyLoans";
import History from "./pages/user/History";
import MyAccount from "./pages/MyAccount";
import AccountScreen from "./pages/AccountScreen";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBooks from "./pages/admin/ManageBooks";
import ManageReservation from "./pages/admin/ManageReservation";
import ManageLoans from "./pages/admin/ManageLoans";
import ManageUsers from "./pages/admin/ManageUsers";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/books" element={<Books />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/my-loans" element={<MyLoans />} />
          <Route path="/history" element={<History />} />
          <Route path="/my-account" element={<AccountScreen variant="member" />} />

          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/books" element={<ManageBooks />} />
            <Route path="/admin/reservations" element={<ManageReservation />} />
            <Route path="/admin/loans" element={<ManageLoans />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/account" element={<AccountScreen variant="admin" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
