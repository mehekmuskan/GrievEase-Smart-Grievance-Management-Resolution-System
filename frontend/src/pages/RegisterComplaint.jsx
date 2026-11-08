
import { useState } from "react";
import ComplaintForm from "../components/ComplaintForm";
import { submitComplaint } from "../services/complaintService";

function RegisterComplaint() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleComplaintSubmit = async (complaintData) => {
    // Prevent duplicate submissions
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
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="site-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏛️</span>
            <div>
              <h1>GrievEase</h1>
              <p>Smart Grievance Management System</p>
            </div>
          </div>

          <span className="header-label">Citizen Portal</span>
        </div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <span className="welcome-tag">
            PUBLIC GRIEVANCE PORTAL
          </span>

          <h1>Your Voice Matters.</h1>

          <p>
            Submit your grievances online and help us
            build a better and more responsive community.
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
              Your complaint has been registered.
            </p>

            <div className="complaint-id">
              <span>Your Complaint ID</span>
              <strong>{success.complaint_id}</strong>
            </div>

            <p>
              Status: <strong>{success.status}</strong>
            </p>

            <button onClick={() => {
              setSuccess(null);
              setError("");
            }}>
              Register Another Complaint
            </button>
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
