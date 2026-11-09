import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/adminService";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await loginAdmin(formData);

      // Store authentication details for this browser session
      sessionStorage.setItem("adminToken", response.access_token);
      sessionStorage.setItem("adminData", JSON.stringify(response.admin));

      // Open admin dashboard
      navigate("/admin-dashboard");
    } catch (err) {
      const message = err.response?.data?.detail;

      setError(
        typeof message === "string"
          ? message
          : "Unable to login. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="site-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <div>
              <h1>GrievEase</h1>
              <p>Smart Grievance Management System</p>
            </div>
          </div>

          <div className="header-label">
            Admin Portal
            <a
              href="/"
              style={{
                color: "white",
                marginLeft: "18px",
                textDecoration: "underline",
              }}
            >
              Citizen Portal
            </a>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <span className="welcome-tag">ADMINISTRATION PORTAL</span>

          <h1>Admin Login</h1>

          <p>
            Login to your administrator account to manage
            grievances and support citizens.
          </p>
        </section>

        <form className="complaint-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h2>Administrator Login</h2>
            <p>Enter your registered email address and password.</p>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <fieldset disabled={loading} style={{ border: "none", padding: 0 }}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="email">Email Address *</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="password">Password *</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Don't have an admin account?{" "}
            <Link to="/admin-register">Register here</Link>
          </p>
        </form>
      </main>

      <footer className="site-footer">
        © 2026 GrievEase | Smart Grievance Management System
      </footer>
    </div>
  );
}

export default AdminLogin;