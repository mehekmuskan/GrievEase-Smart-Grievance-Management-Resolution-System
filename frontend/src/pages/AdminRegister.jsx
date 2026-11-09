import { useState } from "react";
import { registerAdmin } from "../services/adminService";

function AdminRegister() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    password: "",
    confirm_password: "",
    registration_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

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

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.phone.length < 10 || formData.phone.length > 15) {
      setError("Phone number must contain between 10 and 15 digits.");
      return;
    }

    if (!/^\d+$/.test(formData.phone)) {
      setError("Phone number must contain digits only.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const adminData = { ...formData };
      delete adminData.confirm_password;

      const response = await registerAdmin(adminData);

      setSuccess(response);

      setFormData({
        full_name: "",
        email: "",
        phone: "",
        department: "",
        password: "",
        confirm_password: "",
        registration_code: "",
      });
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Unable to register administrator. Please try again.";

      setError(
        typeof message === "string"
          ? message
          : "Please check the information you entered."
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
  <a href="/" style={{ color: "white", marginLeft: "18px", textDecoration: "underline" }}>
    Citizen Portal
  </a>
</div>
        </div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <span className="welcome-tag">ADMINISTRATION PORTAL</span>

          <h1>Admin Registration</h1>

          <p>
            Create an authorized administrator account
            to manage grievances and support citizens.
          </p>
        </section>

        {success ? (
          <div className="success-card">
            <div className="success-icon">✓</div>

            <h2>Admin Registered Successfully!</h2>

            <p>
              The administrator account has been created.
            </p>

            <div className="complaint-id">
              <span>Administrator ID</span>
              <strong>{success.id}</strong>
            </div>

            <p>
              Name: <strong>{success.full_name}</strong>
            </p>

            <p>
              Email: <strong>{success.email}</strong>
            </p>

            <button onClick={() => setSuccess(null)}>
              Register Another Admin
            </button>
          </div>
        ) : (
          <form className="complaint-form" onSubmit={handleSubmit}>
            <div className="form-heading">
              <h2>Create Administrator Account</h2>
              <p>
                Enter the required details. All fields are mandatory.
              </p>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <fieldset disabled={loading} style={{ border: "none", padding: 0 }}>
              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="full_name">Full Name *</label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
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

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    maxLength={15}
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department *</label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">
                    Confirm Password *
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="registration_code">
                    Admin Registration Code *
                  </label>
                  <input
                    id="registration_code"
                    name="registration_code"
                    type="password"
                    value={formData.registration_code}
                    onChange={handleChange}
                    placeholder="Enter authorized registration code"
                    required
                  />
                  <small>
                    This code is provided only to authorized administrators.
                  </small>
                </div>

              </div>
            </fieldset>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Create Admin Account"}
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="site-footer">
        © 2026 GrievEase | Smart Grievance Management System
      </footer>
    </div>
  );
}

export default AdminRegister;


