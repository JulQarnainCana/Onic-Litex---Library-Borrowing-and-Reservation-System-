import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Redirect kung logged in na
  useEffect(() => {
    if (user) {
      navigate(isAdmin ? "/admin" : "/catalog", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      alert("Registered successfully! You can now login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Side */}
        <div className="auth-left">
          <div className="left-content">
            <h1>Join Our Library</h1>
            <p>Create an account to access thousands of titles and start borrowing.</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-right">
          <div className="form-wrapper">
            <div className="auth-logo">
              <span style={{ marginRight: "8px" }}>📚</span>
              Onix Library
            </div>
            
            <h2>Create Account</h2>
            <p className="subtitle">Start your reading journey today</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account ➔"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
              <br />
              <Link to="/">← Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;