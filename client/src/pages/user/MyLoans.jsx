import { useState, useEffect } from "react";
import { getMyLoans } from "../../services/loanService"; 
import "../../styles/pages.css";

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const data = await getMyLoans();
        console.log("Loans state being set to:", data);
        setLoans(data);
      } catch (err) {
        setError("Could not load loans. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  if (loading) return <div className="loading-state">Syncing with library records...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container">
      <h1>My Loans</h1>
      <p>Current borrowed books and due dates.</p>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Borrowed</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loans && loans.length > 0 ? (
              loans.map((loan) => (
                <tr key={loan._id}>
                  <td>
                    
                    <strong>{loan.book?.title || loan.bookId?.title || "Loading Title..."}</strong>
                  </td>
                  <td>{new Date(loan.borrowDate || loan.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-success">
                      {loan.status?.toUpperCase() || "BORROWED"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  No active loans found. If you just borrowed a book, try refreshing.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}