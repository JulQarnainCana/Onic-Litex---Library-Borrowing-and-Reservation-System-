import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-brand">
          <span aria-hidden>📚</span> Onic Litex
        </div>
        <nav className="landing-nav">
          {user ? (
            <Link className="btn-solid" to={isAdmin ? "/admin" : "/catalog"}>
              {isAdmin ? "Admin dashboard" : "Go to catalog"}
            </Link>
          ) : (
            <>
              <Link className="btn-outline" to="/login">
                Sign in
              </Link>
              <Link className="btn-solid" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="landing-hero">
        <div>
          <h1>Your library, one sign-in away.</h1>
          <p className="lead">
            Choose <strong>Sign in</strong> or <strong>Register</strong> to access the library.
          </p>
          <div className="landing-cta">
            {user ? (
              <Link className="primary" to={isAdmin ? "/admin" : "/catalog"}>
                Continue →
              </Link>
            ) : (
              <>
                <Link className="primary" to="/register">
                  Create account
                </Link>
                <Link className="secondary" to="/login">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="landing-card">
          <h3>After you log in</h3>
          <ul className="landing-features">
            <li>Members land on the catalog to browse and borrow.</li>
            <li>Reservations: Place a reservation on available books or join a waiting list.</li>
            <li>Loan Management: View current borrowed books, due dates, and overdue fines.</li>
            <li>History Access a personal history of previously borrowed materials.</li>
          </ul>
        </div>
      </section>

      <footer className="landing-footer">Onic Litex · Library access for IPT</footer>
    </div>
  );
}
