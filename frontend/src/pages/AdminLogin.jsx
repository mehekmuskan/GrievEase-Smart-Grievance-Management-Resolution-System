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
      <main className="main-content">
        <section className="welcome-section">
          <span className="welcome-tag">ADMINISTRATION PORTAL</span>

          <h1>Admin Login</h1>

          <p>
            Login to your administrator account to manage
            grievances and support citizens.
          </p>
        </section>

        <div style={{
          maxWidth: "500px",
          margin: "0 auto 20px auto",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "13px",
          color: "#166534"
        }}>
          💡 <strong>Default Demo Admin Credentials:</strong><br />
          Email: <code style={{ background: "#dcfce7", padding: "2px 4px", borderRadius: "4px" }}>admin@grievease.gov.in</code><br />
          Password: <code style={{ background: "#dcfce7", padding: "2px 4px", borderRadius: "4px" }}>Admin@12345</code>
        </div>

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