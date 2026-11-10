import { useState } from "react";
import ComplaintForm from "../components/ComplaintForm";
import { submitComplaint } from "../services/complaintService";

function RegisterComplaint() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleComplaintSubmit = async (complaintData) => {
    if (loading) return;

    setLoading(true);
    setSuccess(null);
    setError("");

    try {
      const response = await submitComplaint(complaintData);

      if (response && response.success) {
        setSuccess(response);
      } else {
        setError(
          response?.message || "Unable to submit complaint. Please try again."
        );
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setError(err.message || "Unable to register complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <section className="welcome-section">
          <span className="welcome-tag">
            PUBLIC GRIEVANCE PORTAL
          </span>

          <h1>Your Voice Matters.</h1>

          <p>
            Submit your grievances online with AI-assisted classification and help us
            build a responsive, accountable community.
          </p>
        </section>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {success ? (
          <div className="success-card">
            <div className="success-icon">✓</div>

            <h2>Complaint Submitted Successfully!</h2>

            <p>
              Thank you for reporting your grievance.
              Your complaint has been registered in the system.
            </p>

            <div className="complaint-id">
              <span>Your Tracking Complaint ID</span>
              <strong>{success.complaint_id}</strong>
            </div>

            <p>
              Current Status: <strong>{success.status}</strong>
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <button
                onClick={() => {
                  setSuccess(null);
                  setError("");
                }}
              >
                Register Another Complaint
              </button>
              <a
                href={`/track?id=${encodeURIComponent(success.complaint_id)}`}
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                Track This Complaint
              </a>
            </div>
          </div>
        ) : (
          <ComplaintForm
            onSubmit={handleComplaintSubmit}
            loading={loading}
          />
        )}
      </main>

      <footer className="site-footer">
        © 2026 GrievEase | Smart Grievance Management System
      </footer>
    </div>
  );
}

export default RegisterComplaint;
