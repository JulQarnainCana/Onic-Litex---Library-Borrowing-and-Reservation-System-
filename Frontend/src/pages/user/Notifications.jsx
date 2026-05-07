import { useState, useEffect } from "react";
import { getMyNotifications } from "../../services/loanService"; 
import "../../styles/pages.css";
import { ErrorState, LoadingState } from "../../components/AsyncState";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getMyNotifications();
        console.log("Notifications state being set to:", data);
        setNotifications(data);
      } catch (err) {
        setError("Could not load notifications. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <LoadingState message="Checking notifications..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="page-container">
      <h1>Notifications</h1>
      <p>View your overdue books and other alerts.</p>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Message</th>
              <th>Book Title</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {notifications && notifications.length > 0 ? (
              notifications.map((notif) => (
                <tr key={notif._id}>
                  <td style={{ 
                    color: notif.type === "overdue" ? "var(--danger-color, #f5301aff)" : "inherit", 
                    fontWeight: "bold" 
                  }}>
                    {notif.message}
                  </td>
                  <td>
                    <strong>{notif.book?.title || notif.bookId?.title || "Loading Title..."}</strong>
                  </td>
                  <td style={{ 
                    color: notif.type === "overdue" ? "var(--danger-color, #e74c3c)" : "inherit", 
                    fontWeight: notif.type === "overdue" ? "bold" : "normal" 
                  }}>
                    {new Date(notif.dueDate || notif.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {notif.type === "overdue" ? (
                      <span className="badge" style={{ backgroundColor: "var(--danger-color, #e74c3c)", color: "white" }}>
                        OVERDUE
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: notif.type === "reservation_cancelled" ? "#e74c3c" : "#2ecc71", color: "white" }}>
                        {notif.type === "returned" ? "RETURNED" : notif.type === "reservation_fulfilled" ? "FULFILLED" : "CANCELLED"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  No new notifications at this time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
