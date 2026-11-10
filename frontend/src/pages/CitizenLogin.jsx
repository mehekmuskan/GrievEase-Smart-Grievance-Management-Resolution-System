import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginCitizen } from "../services/citizenService";

export default function CitizenLogin() {
  const navigate = useNavigate();
  const [data, setData] = useState({email:"",password:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await loginCitizen(data);
      sessionStorage.setItem("citizenToken", response.access_token);
      sessionStorage.setItem("citizenData", JSON.stringify(response.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <section className="welcome-section">
          <h1>Citizen Login</h1>
          <p>Login to submit and manage your grievances.</p>
        </section>

        <div style={{
          maxWidth: "480px",
          margin: "0 auto 20px auto",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          padding: "10px 16px",
          fontSize: "13px",
          color: "#1e40af"
        }}>
          💡 <strong>Default Demo Citizen:</strong><br />
          Email: <code style={{ background: "#dbeafe", padding: "2px 4px", borderRadius: "4px" }}>citizen@example.com</code><br />
          Password: <code style={{ background: "#dbeafe", padding: "2px 4px", borderRadius: "4px" }}>Citizen@12345</code>
        </div>
        <form className="complaint-form" onSubmit={submit}>
          <div className="form-heading"><h2>Login to GrievEase</h2></div>
          {error && <p className="error-message">{error}</p>}
          <fieldset disabled={loading} style={{border:"none",padding:0}}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Email *</label>
                <input required type="email" value={data.email}
                  onChange={e=>setData({...data,email:e.target.value})}
                  placeholder="Enter registered email"/>
              </div>
              <div className="form-group full-width">
                <label>Password *</label>
                <input required type="password" value={data.password}
                  onChange={e=>setData({...data,password:e.target.value})}
                  placeholder="Enter password"/>
              </div>
            </div>
          </fieldset>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
          <p style={{textAlign:"center",marginTop:20}}>
            New citizen? <Link to="/citizen-register">Register here</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
