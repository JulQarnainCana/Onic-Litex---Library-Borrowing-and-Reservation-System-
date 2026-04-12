import { useState } from "react";
import "../../styles/pages.css";

const past = [
  { id: "H-501", title: "Pride and Prejudice", borrowed: "Jan 10, 2026", returned: "Feb 4, 2026" },
  { id: "H-502", title: "1984", borrowed: "Nov 2, 2025", returned: "Nov 28, 2025" },
  { id: "H-503", title: "The Great Gatsby", borrowed: "Aug 5, 2025", returned: "Sep 1, 2025" },
];

export default function History() {
  const [items] = useState(past);

  return (
    <>
      <h1>History</h1>
      <p>Personal history of materials you have previously borrowed.</p>

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
            {items.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.title}</td>
                <td>{row.borrowed}</td>
                <td>{row.returned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
