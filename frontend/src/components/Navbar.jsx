import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState(null);
  const [admin, setAdmin] = useState(null);

  const checkAuth = () => {
    try {
      const citizenData = sessionStorage.getItem("citizenData");
      const citizenToken = sessionStorage.getItem("citizenToken");
      setCitizen(citizenToken && citizenData ? JSON.parse(citizenData) : null);

      const adminData = sessionStorage.getItem("adminData");
      const adminToken = sessionStorage.getItem("adminToken");
      setAdmin(adminToken && adminData ? JSON.parse(adminData) : null);
    } catch {
      setCitizen(null);
      setAdmin(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const handleCitizenLogout = () => {
    sessionStorage.removeItem("citizenToken");
    sessionStorage.removeItem("citizenData");
    checkAuth();
    navigate("/");
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminData");
    checkAuth();
    navigate("/admin-login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="global-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo-icon">🏛️</span>
          <div className="navbar-brand-text">
            <span className="navbar-title">GrievEase</span>
            <span className="navbar-subtitle">Smart Grievance Resolution</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="navbar-links">
          <Link
            to="/"
            className={`nav-item ${isActive("/") ? "active" : ""}`}
          >
            <span>📝</span> Register Grievance
          </Link>
          <Link
            to="/track"
            className={`nav-item ${isActive("/track") ? "active" : ""}`}
          >
            <span>🔍</span> Track Status
          </Link>
          <Link
            to="/department"
            className={`nav-item ${isActive("/department") ? "active" : ""}`}
          >
            <span>🏛️</span> Department
          </Link>
          <Link
            to="/officer"
            className={`nav-item ${isActive("/officer") ? "active" : ""}`}
          >
            <span>👮</span> Officer
          </Link>
          <Link
            to="/admin-dashboard"
            className={`nav-item ${isActive("/admin-dashboard") ? "active" : ""}`}
          >
            <span>🛡️</span> Admin Dashboard
          </Link>
        </nav>

        {/* Auth / Account Controls */}
        <div className="navbar-auth">
          {citizen ? (
            <div className="user-badge-wrap">
              <span className="user-badge citizen-badge">
                👤 {citizen.full_name || "Citizen"}
              </span>
              <button
                onClick={handleCitizenLogout}
                className="nav-logout-btn"
                title="Log out from citizen account"
              >
                Logout
              </button>
            </div>
          ) : admin ? (
            <div className="user-badge-wrap">
              <span className="user-badge admin-badge">
                🛡️ {admin.full_name || "Admin"}
              </span>
              <button
                onClick={handleAdminLogout}
                className="nav-logout-btn"
                title="Log out from admin account"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/citizen-login" className="auth-btn citizen-login-btn">
                Citizen Login
              </Link>
              <Link to="/admin-login" className="auth-btn admin-login-btn">
                Admin Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
