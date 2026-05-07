import { useEffect, useState } from "react";
import { getMyHistory } from "../../services/loanService";
import "../../styles/pages.css";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyHistory();
        setItems(data);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err.response?.data?.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "-";

  return (
    <>
      <h1>History</h1>
      <p>Personal history of materials you have previously borrowed.</p>

      {loading ? (
        <div className="page-card">Loading history...</div>
      ) : error ? (
        <div className="page-card">{error}</div>
      ) : items.length === 0 ? (
        <div className="page-card">No returned books yet.</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Title</th>
                <th>Borrowed</th>
                <th>Returned</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => (
                <tr key={row._id}>
                  <td>{`H-${String(index + 1).padStart(3, "0")}`}</td>
                  <td>{row.book?.title || "Untitled book"}</td>
                  <td>{formatDate(row.borrowDate)}</td>
                  <td>{formatDate(row.returnDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
