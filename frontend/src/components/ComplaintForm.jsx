
import { useState } from "react";

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
  });

  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");

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
