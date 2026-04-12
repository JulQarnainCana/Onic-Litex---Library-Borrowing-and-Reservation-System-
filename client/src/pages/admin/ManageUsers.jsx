import { useState } from "react";
import "../../styles/pages.css";

const seed = [
  { id: "u1", name: "Erin Lee", email: "erin@school.edu", role: "member", status: "pending" },
  { id: "u2", name: "Miguel Santos", email: "miguel@school.edu", role: "member", status: "pending" },
  { id: "u3", name: "Sofia Khan", email: "sofia@school.edu", role: "member", status: "active" },
];

export default function ManageUsers() {
  const [users, setUsers] = useState(seed);

  const verify = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)));
    alert("Member verified (demo).");
  };

  const toggleActive = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  };

  return (
    <>
      <h1>Admin user management</h1>
      <p>Verify new member registrations and manage account statuses.</p>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span
                    className={`badge ${
                      u.status === "active" ? "badge-success" : u.status === "pending" ? "badge-warn" : "badge-muted"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td>
                  <div className="btn-row">
                    {u.status === "pending" && (
                      <button type="button" className="btn-sm primary" onClick={() => verify(u.id)}>
                        Verify
                      </button>
                    )}
                    {u.status !== "pending" && (
                      <button type="button" className="btn-sm secondary" onClick={() => toggleActive(u.id)}>
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
