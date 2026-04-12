import "../../styles/pages.css";

const stats = {
  catalogBooks: 1248,
  registeredUsers: 432,
  activeBorrowers: 86,
  booksOnLoan: 112,
  pendingReservations: 14,
  pendingMemberVerification: 5,
  overdueLoans: 3,
};

export default function AdminDashboard() {
  return (
    <>
      <h1>Dashboard</h1>
      <p>Centralized library statistics: collection size, members, borrowing activity, and reservations.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{stats.catalogBooks.toLocaleString()}</div>
          <div className="label">Books in catalog</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.registeredUsers.toLocaleString()}</div>
          <div className="label">Registered users</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.activeBorrowers}</div>
          <div className="label">Users with an active loan</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.booksOnLoan}</div>
          <div className="label">Books currently borrowed</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.pendingReservations}</div>
          <div className="label">Pending reservations</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.pendingMemberVerification}</div>
          <div className="label">Registrations to verify</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.overdueLoans}</div>
          <div className="label">Overdue loans</div>
        </div>
      </div>

      <div className="page-card">
        <h2>Notifications</h2>
        <p className="desc">
          These is for the alerts and notifications of books, loans, and reservations.
        </p>
      </div>
    </>
  );
}
