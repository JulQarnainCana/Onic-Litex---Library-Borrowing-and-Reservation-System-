import { useState, useEffect, useCallback } from "react";
import API from "../../services/api"; 
import "../../styles/pages.css";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      
      const res = await API.get("/reservations/me"); 
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch reservations", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      
      await API.put(`/reservations/cancel/${id}`); 
      alert("Reservation cancelled.");
      fetchReservations(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel reservation.");
    }
  };

  if (loading) return (
    <div className="loading-state">
      <p>Syncing your waitlist...</p>
    </div>
  );

  return (
    <>
      <h1>My Reservations</h1>
      <p>Manage your current book reservations and waiting list status.</p>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((res) => (
                <tr key={res._id}>
                  <td>
                    {/* Binago para tumugma sa populated 'book' ng schema mo */}
                    <strong>{res.book?.title || "Unknown Book"}</strong>
                  </td>
                  <td>{new Date(res.createdAt).toLocaleDateString()}</td>
                  <td>
                    {/* Dynamic colors base sa schema enum (pending, fulfilled, cancelled) */}
                    <span className={`badge ${
                      res.status === "fulfilled" ? "badge-success" : 
                      res.status === "cancelled" ? "badge-danger" : "badge-warn"
                    }`}>
                      {res.status ? res.status.toUpperCase() : "PENDING"}
                    </span>
                  </td>
                  <td>
                    {/* Pwede lang i-cancel kapag pending pa */}
                    {res.status === "pending" && (
                      <button 
                        className="btn-sm danger" 
                        onClick={() => handleCancel(res._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  You don't have any active reservations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}