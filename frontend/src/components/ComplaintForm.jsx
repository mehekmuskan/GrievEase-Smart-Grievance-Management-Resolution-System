
import { useState, useEffect } from "react";
import { classifyGrievance } from "../services/complaintService";

function ComplaintForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    citizen_name: "",
    mobile_number: "",
    email: "",
    complaint_title: "",
    description: "",
    district: "",
    location: "",
    category: "",
    language: "English",
    priority: "Medium",
  });

  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isCitizenLoggedIn, setIsCitizenLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("citizenData");
      if (stored) {
        const citizen = JSON.parse(stored);
        if (citizen?.full_name || citizen?.email) {
          setIsCitizenLoggedIn(true);
          setFormData((prev) => ({
            ...prev,
            citizen_name: prev.citizen_name || citizen.full_name || "",
            email: prev.email || citizen.email || "",
          }));
        }
      }
    } catch {
      // Ignore json parse error
    }
  }, []);

  const handleAiClassify = async () => {
    if (!formData.complaint_title.trim() && !formData.description.trim()) {
      setError("Please enter a title and description before using AI Assist.");
      return;
    }
    setError("");
    setAiLoading(true);
    try {
      const title = formData.complaint_title.trim() || "Grievance";
      const desc = formData.description.trim() || formData.complaint_title.trim();
      const res = await classifyGrievance(title, desc);
      setAiResult(res);

      setFormData((prev) => ({
        ...prev,
        category: res.category !== "Other" ? res.category : (prev.category || "Other"),
        priority: res.priority || prev.priority,
        language: res.language || prev.language,
      }));
    } catch (err) {
      setError(err.message || "AI Classification service temporarily unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile_number" && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setError("");

    if (!file) {
      setDocument(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG and PNG files are allowed.");
      e.target.value = "";
      setDocument(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      e.target.value = "";
      setDocument(null);
      return;
    }

    setDocument(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!/^[6-9]\d{9}$/.test(formData.mobile_number)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (formData.description.trim().length < 10) {
      setError("Complaint description must contain at least 10 characters.");
      return;
    }

    onSubmit({
      ...formData,
      citizen_name: formData.citizen_name.trim(),
      complaint_title: formData.complaint_title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      priority: formData.priority || "Medium",
      document,
    });
  };

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>Register Your Complaint</h2>
        <p>
          Fill in the details below to submit your grievance.
          Fields marked with * are mandatory.
        </p>
      </div>

      {isCitizenLoggedIn && (
        <div style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          padding: "10px 16px",
          marginBottom: "16px",
          color: "#1e40af",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>👤 Verified Citizen: <strong>{formData.citizen_name || "Citizen"}</strong> ({formData.email})</span>
          <span style={{ fontSize: "12px", background: "#dbeafe", padding: "3px 8px", borderRadius: "12px" }}>Auto-linked</span>
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <fieldset disabled={loading} className="form-fields">
        <div className="form-grid">

          <div className="form-group">
            <label htmlFor="citizen_name">Citizen Name *</label>
            <input
              id="citizen_name"
              type="text"
              name="citizen_name"
              value={formData.citizen_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile_number">Mobile Number *</label>
            <input
              id="mobile_number"
              type="tel"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address (Optional)</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Complaint Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity">Electricity</option>
              <option value="Roads">Roads and Infrastructure</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="complaint_title">Complaint Title *</label>
            <input
              id="complaint_title"
              type="text"
              name="complaint_title"
              value={formData.complaint_title}
              onChange={handleChange}
              placeholder="Briefly describe your complaint"
              required
              maxLength={150}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">
              Detailed Complaint Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain your complaint in detail..."
              rows="5"
              minLength={10}
              required
            />
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleAiClassify}
                disabled={aiLoading}
                style={{
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {aiLoading ? "🤖 Analyzing..." : "✨ AI Smart Assist: Auto-Categorize & Prioritize"}
              </button>
              <small style={{ color: "#6b7280" }}>
                Automatically classifies category, priority and suggests resolution based on your description.
              </small>
            </div>

            {aiResult && (
              <div style={{
                marginTop: "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "13px",
                color: "#166534"
              }}>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                  🤖 AI Insight: {aiResult.category} — Priority: <span style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: aiResult.priority === "High" ? "#fee2e2" : aiResult.priority === "Medium" ? "#fef3c7" : "#e0f2fe",
                    color: aiResult.priority === "High" ? "#991b1b" : aiResult.priority === "Medium" ? "#92400e" : "#075985",
                    fontWeight: "bold"
                  }}>{aiResult.priority}</span> ({Math.round((aiResult.confidence || 0.8) * 100)}% match)
                </div>
                <div style={{ color: "#374151", marginBottom: "4px" }}>
                  <strong>Suggested Resolution:</strong> {aiResult.suggested_resolution}
                </div>
                <div style={{ color: "#6b7280", fontSize: "12px" }}>
                  {aiResult.explanation}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="district">District *</label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
            >
              <option value="">Select district</option>
              <option value="Ballari">Ballari</option>
              <option value="Bengaluru Urban">Bengaluru Urban</option>
              <option value="Belagavi">Belagavi</option>
              <option value="Dharwad">Dharwad</option>
              <option value="Kalaburagi">Kalaburagi</option>
              <option value="Mysuru">Mysuru</option>
              <option value="Shivamogga">Shivamogga</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location / Area *</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter village, town or area"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="language">Preferred Language *</label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
            >
              <option value="English">English</option>
              <option value="Kannada">Kannada</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="document">Upload Supporting Document</label>
            <input
              id="document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            <small>PDF, JPG or PNG. Maximum 5 MB.</small>

            {document && (
              <small className="file-name">
                Selected: {document.name}
              </small>
            )}
          </div>

        </div>
      </fieldset>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </div>
    </form>
  );
}

export default ComplaintForm;
