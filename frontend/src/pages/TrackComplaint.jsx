
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getComplaintById } from "../services/complaintService";

function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setComplaintId(idFromUrl);
      fetchComplaint(idFromUrl);
    }
  }, [searchParams]);

  const fetchComplaint = async (idToSearch) => {
    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const result = await getComplaintById(idToSearch.trim());

      if (!result || !result.complaint_id) {
        throw new Error("Invalid complaint details received from server.");
      }

      setComplaint(result);
    } catch (err) {
      setError(
        err.message || "Unable to find your complaint. Please check your Complaint ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleTrack = async (e) => {
    e.preventDefault();

    if (!complaintId.trim()) {
      setError("Please enter your Complaint ID.");
      setComplaint(null);
      return;
    }

    await fetchComplaint(complaintId);
  };

  const statusOrder = {
    Pending: 0,
    "In Progress": 1,
    Resolved: 2,
  };

  const currentStatus = complaint
    ? statusOrder[complaint.status] ?? -1
    : -1;

  const statuses = ["Pending", "In Progress", "Resolved"];

  return (
    <div className="tracking-container">
      <h1>Track Your Complaint</h1>

      <p>Enter your Complaint ID to check the latest status.</p>

      <form onSubmit={handleTrack}>
        <input
          type="text"
          placeholder="Example: GRV-20261109-30803F"
          value={complaintId}
          onChange={(e) => {
            setComplaintId(e.target.value);
            setError("");
          }}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Track Complaint"}
        </button>
      </form>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {complaint && (
        <div className="complaint-result">
          <h2>Complaint Details</h2>

          {/* Complaint Status Progress */}
          {currentStatus !== -1 && (
            <div className="status-tracker">
              {statuses.map((status, index) => (
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
              ))}
            </div>
          )}

          {/* Complaint Information */}
          <div className="complaint-info">
            <p>
              <strong>Complaint ID:</strong>{" "}
              {complaint.complaint_id}
            </p>

            <p>
              <strong>Citizen Name:</strong>{" "}
              {complaint.citizen_name || "N/A"}
            </p>

            <p>
              <strong>Mobile Number:</strong>{" "}
              {complaint.mobile || "N/A"}
            </p>

            <p>
              <strong>Title:</strong>{" "}
              {complaint.title || "N/A"}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {complaint.category || "N/A"}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {complaint.description || "N/A"}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {complaint.location || "N/A"}
            </p>

            <p>
              <strong>Preferred Language:</strong>{" "}
              {complaint.language || "N/A"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status-badge ${
                  (complaint.status || "unknown")
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                }`}
              >
                {complaint.status || "Unknown"}
              </span>
            </p>

            <p>
              <strong>Priority:</strong>{" "}
              {complaint.priority || "N/A"}
            </p>

            <p>
              <strong>Department:</strong>{" "}
              {complaint.department || "Not assigned"}
            </p>

            <p>
              <strong>Assigned Officer:</strong>{" "}
              {complaint.assigned_officer || "Not assigned"}
            </p>
          </div>

          {/* Follow-up Information */}
          <div className="follow-up-section">
            <h3>Follow-up Information</h3>

            <p>
              <strong>Next Follow-up:</strong>{" "}
              {formatDate(complaint.next_follow_up)}
            </p>

            <p>
              <strong>Overdue Status:</strong>{" "}
              <span
                className={`status-badge ${
                  complaint.is_overdue ? "overdue" : "on-time"
                }`}
              >
                {complaint.is_overdue ? "Overdue" : "Not Overdue"}
              </span>
            </p>

            <p>
              <strong>Escalation Level:</strong>{" "}
              {complaint.escalation_level ?? 0}
            </p>
          </div>

          {/* Date Information */}
          <div className="date-section">
            <h3>Complaint Timeline</h3>

            <p>
              <strong>Created At:</strong>{" "}
              {formatDate(complaint.created_at)}
            </p>

            <p>
              <strong>Last Updated:</strong>{" "}
              {formatDate(complaint.updated_at)}
            </p>
          </div>

          {/* Rejected Status */}
          {complaint.status?.toLowerCase() === "rejected" && (
            <p className="error-message">
              This complaint has been rejected.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default TrackComplaint;
