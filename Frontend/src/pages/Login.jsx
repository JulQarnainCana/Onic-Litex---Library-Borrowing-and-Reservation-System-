import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const { user, login, isAdmin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  
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
      const res = await loginUser(form);
      
     
      login(res.token, res.user);
      
      alert("Login successful!");
      
      
      const adminRole = res.user?.role === "admin";
      navigate(adminRole ? "/admin" : "/catalog", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Invalid email or password");
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
            <h1>Welcome Back</h1>
            <p>Sign in to continue your reading journey with LiteX.</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="auth-right">
          <div className="form-wrapper">
            <div className="auth-logo">
              <span style={{ marginRight: "8px" }}>📚</span>
              Onix Library
            </div>
            
            <h2>Sign In</h2>
            <p className="subtitle">Welcome back! Please enter your details.</p>

            <form onSubmit={handleSubmit}>
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
                {loading ? "Signing In..." : "Sign In ➔"}
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account? <Link to="/register">Create Account</Link>
              <br />
              <Link to="/">← Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;