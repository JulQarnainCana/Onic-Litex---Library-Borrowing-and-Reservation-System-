import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

function navCls({ isActive }) {
  return `sidebar-nav-link${isActive ? " is-active" : ""}`;
}

export default function AdminSidebar() {
  return (
    <aside className="sidebar admin-sidebar">
      <h2>📚 LiteX Admin</h2>
      <nav>
        <ul>
          <li>
            <NavLink to="/admin" end className={navCls}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/books" className={navCls}>
              Manage Books
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/reservations" className={navCls}>
              Manage Reservations
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/loans" className={navCls}>
              Manage Loans
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/users" className={navCls}>
              Manage Users
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/account" className={navCls}>
              My Account
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
