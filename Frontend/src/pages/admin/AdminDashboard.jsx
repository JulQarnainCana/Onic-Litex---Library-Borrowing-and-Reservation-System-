import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/pages.css";
import { ErrorState, LoadingState } from "../../components/AsyncState";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");

        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setError(error.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Updating statistics..." />;
  if (!stats) return <ErrorState message={error || "Failed to load dashboard."} />;

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
          <div className="label">Inactive member accounts</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.overdueLoans}</div>
          <div className="label">Overdue loans</div>
        </div>
      </div>

      <div className="page-card">
        <h2>Notifications</h2>
        <p className="desc">
          There are <strong>{stats.pendingReservations}</strong> reservations waiting for action and <strong>{stats.overdueLoans}</strong> overdue loans to review.
        </p>
      </div>
    </>
  );
}
