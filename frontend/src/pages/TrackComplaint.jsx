
import { useState } from "react";
import { getComplaintById } from "../services/complaintService";

function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();

    if (!complaintId.trim()) {
      setError("Please enter your Complaint ID.");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const result = await getComplaintById(complaintId);
      setComplaint(result);
    } catch (err) {
      setError(err.message || "Unable to find your complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracking-container">
      <h1>Track Your Complaint</h1>
      <p>Enter your Complaint ID to check the latest status.</p>

      <form onSubmit={handleTrack}>
        <input
          type="text"
          placeholder="Example: GRV-20261109-30803F"
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Track Complaint"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

     {complaint && (
  <div className="complaint-result">
    <h2>Complaint Details</h2>

    <div className="status-tracker">
      {["Pending", "In Progress", "Resolved"].map((status, index) => {
        const statusOrder = {
          Pending: 0,
          "In Progress": 1,
          Resolved: 2,
          Rejected: -1,
        };

        const currentStatus = statusOrder[complaint.status] ?? 0;

        return (
          <div
            key={status}
            className={`status-step ${
              currentStatus >= index ? "completed" : ""
            }`}
          >
            <div className="status-circle">
              {currentStatus >= index ? "✓" : index + 1}
            </div>
            <span>{status}</span>
          </div>
        );
      })}
    </div>

    <p><strong>Complaint ID:</strong> {complaint.complaint_id}</p>
    <p><strong>Title:</strong> {complaint.title}</p>
    <p><strong>Category:</strong> {complaint.category || "N/A"}</p>
    <p><strong>Description:</strong> {complaint.description}</p>
    <p><strong>Location:</strong> {complaint.location || "N/A"}</p>
    <p>
  <strong>Status:</strong>{" "}
  <span className={`status-badge ${complaint.status.toLowerCase().replace(" ", "-")}`}>
    {complaint.status}
  </span>
</p>
    <p><strong>Priority:</strong> {complaint.priority}</p>
    <p><strong>Department:</strong> {complaint.department || "Not assigned"}</p>
    <p><strong>Assigned Officer:</strong> {complaint.assigned_officer || "Not assigned"}</p>
    <p><strong>Escalation Level:</strong> {complaint.escalation_level}</p>
    <p><strong>Created At:</strong> {new Date(complaint.created_at).toLocaleString()}</p>
    <p><strong>Last Updated:</strong> {new Date(complaint.updated_at).toLocaleString()}</p>
  </div>
)}
    </div>
  );
}

export default TrackComplaint;
