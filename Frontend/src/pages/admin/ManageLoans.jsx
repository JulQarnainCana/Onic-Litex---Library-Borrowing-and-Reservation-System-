import { useState, useEffect } from "react";

import { getAllLoans, returnBookAdmin } from "../../services/loanService"; 
import "../../styles/pages.css";
import { LoadingState } from "../../components/AsyncState";

export default function ManageLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      
      const data = await getAllLoans(); 
      
     
      console.log("Data from Backend (Admin Loans):", data); 
      
      setLoans(data);
    } catch (err) {
      console.error("Failed to fetch loans", err);
      
      alert("Error: " + (err.response?.data?.message || err.message)); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleCheckIn = async (loanId) => {
    if (!window.confirm("Is the physical book returned in good condition?")) return;
    
    try {
      await returnBookAdmin(loanId);
      alert("Success: Book record updated and stock returned.");
      fetchLoans(); 
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Check-in failed"));
    }
  };

  if (loading) return <LoadingState message="Loading inventory data..." />;

  return (
    <>
      <h1>Circulation Control</h1>
      <p>Verify physical returns and update book availability.</p>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member Email</th>
              <th>Book Title</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                  No active loans found.
                </td>
              </tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan._id}>
                  <td><strong>{loan.user?.email || "Unknown User"}</strong></td>
                  <td>{loan.book?.title || "Unknown Book"}</td>
                  <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${loan.status === "borrowed" ? "badge-danger" : "badge-success"}`}>
                      {loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1) : "Unknown"}
                    </span>
                  </td>
                  <td>
                    {loan.status !== "returned" && (
                      <button type="button" className="btn-sm primary" onClick={() => handleCheckIn(loan._id)}>
                        Confirm Return
                      </button>
                    )}
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
