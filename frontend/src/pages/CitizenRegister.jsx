import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCitizen } from "../services/citizenService";

export default function CitizenRegister() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    full_name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerCitizen(data);
      alert("Registration successful! Please login.");
      navigate("/citizen-login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <section className="welcome-section">
          <h1>Citizen Registration</h1>
          <p>Create your GrievEase account.</p>
        </section>
        <form className="complaint-form" onSubmit={submit}>
          <div className="form-heading"><h2>Create Account</h2></div>
          {error && <p className="error-message">{error}</p>}
          <fieldset disabled={loading} style={{border:"none",padding:0}}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Full Name *</label>
                <input required minLength="2" value={data.full_name}
                  onChange={e=>setData({...data,full_name:e.target.value})}
                  placeholder="Enter full name"/>
              </div>
              <div className="form-group full-width">
                <label>Email *</label>
                <input required type="email" value={data.email}
                  onChange={e=>setData({...data,email:e.target.value})}
                  placeholder="Enter email"/>
              </div>
              <div className="form-group full-width">
                <label>Password *</label>
                <input required type="password" minLength="8" maxLength="72"
                  value={data.password}
                  onChange={e=>setData({...data,password:e.target.value})}
                  placeholder="Minimum 8 characters"/>
              </div>
            </div>
          </fieldset>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Create Account"}
            </button>
          </div>
          <p style={{textAlign:"center",marginTop:20}}>
            Already registered? <Link to="/citizen-login">Login</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
