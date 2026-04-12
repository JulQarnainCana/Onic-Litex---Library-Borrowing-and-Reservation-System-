import { useState, useEffect } from "react";
import API from "../../services/api";
import "../../styles/pages.css";

export default function ManageReservation() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const res = await API.get("/reservations"); 
      setReservations(res.data);
    } catch (err) {
      console.error("Failed to fetch reservations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  
  const handleFulfill = async (id) => {
    try {
      await API.put(`/reservations/fulfill/${id}`);
      alert("Reservation fulfilled successfully!");
      fetchReservations();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to fulfill"));
    }
  };

  
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      await API.put(`/reservations/cancel/${id}`);
      alert("Reservation cancelled!");
      fetchReservations();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to cancel"));
    }
  };

  if (loading) return <div className="loading-state">Syncing reservations...</div>;

  return (
    <>
      <h1>Admin Reservation Management</h1>
      <p>Approve holds and fulfill reservations when copies are ready for pickup.</p>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th>
              <th>Book</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign: 'center'}}>No pending reservations.</td></tr>
            ) : (
              reservations.map((res) => (
                <tr key={res._id}>
                  <td>{res._id.slice(-5).toUpperCase()}</td>
                 
                  <td>{res.user?.email || "Unknown User"}</td>
                  <td>{res.book?.title || "Unknown Book"}</td>
                  <td>
                    {/* Dynamic badge color base sa status */}
                    <span className={`badge ${
                      res.status === "fulfilled" ? "badge-success" : 
                      res.status === "cancelled" ? "badge-danger" : "badge-warn"
                    }`}>
                      {res.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="btn-row">
                      
                      {res.status === "pending" && (
                        <>
                          <button className="btn-sm primary" onClick={() => handleFulfill(res._id)}>
                            Fulfill
                          </button>
                          <button className="btn-sm secondary" onClick={() => handleCancel(res._id)}>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}