import { useState } from "react";

function ComplaintDetails({
  complaint,
  actions = [],
  onClose,
  onStatusUpdate,
  updating,
}) {
  const [status, setStatus] = useState(complaint.status || "Pending");
  const [remarks, setRemarks] = useState("");

  if (!complaint) return null;

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onStatusUpdate({
      status,
      remarks,
      performed_by: "Admin",
    });
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-heading">
          <div>
            <h2>Complaint Details</h2>
            <p>{complaint.complaint_id}</p>
          </div>
          <button className="admin-close-button" onClick={onClose}>
            X
          </button>
        </div>

        <div className="admin-details-grid">
          <div><strong>Citizen Name</strong><p>{complaint.citizen_name}</p></div>
          <div><strong>Mobile</strong><p>{complaint.mobile || "—"}</p></div>
          <div><strong>Email</strong><p>{complaint.email || "—"}</p></div>
          <div><strong>Category</strong><p>{complaint.category || "—"}</p></div>
          <div><strong>Department</strong><p>{complaint.department || "Unassigned"}</p></div>
          <div><strong>Assigned Officer</strong><p>{complaint.assigned_officer || "Unassigned"}</p></div>
          <div><strong>Priority</strong><p>{complaint.priority || "—"}</p></div>
          <div><strong>Current Status</strong><p>{complaint.status}</p></div>
          <div><strong>Location</strong><p>{complaint.location || "—"}</p></div>
          <div><strong>Submitted</strong><p>{formatDate(complaint.created_at)}</p></div>
        </div>

        <div className="admin-description">
          <strong>Complaint Title</strong>
          <p>{complaint.title}</p>

          <strong>Description</strong>
          <p>{complaint.description}</p>
        </div>

        <div className="admin-history">
          <h3>Complaint Action History</h3>

          {actions.length === 0 ? (
            <p>No action history available.</p>
          ) : (
            actions.map((action) => (
              <div className="admin-history-item" key={action.id}>
                <strong>{action.action}</strong>
                <p>{action.remarks || "No remarks"}</p>
                <small>
                  By {action.performed_by || "Admin"} | {formatDate(action.created_at)}
                </small>
              </div>
            ))
          )}
        </div>

        <form className="admin-update-form" onSubmit={handleSubmit}>
          <h3>Update Complaint Status</h3>

          <label htmlFor="complaint-status">New Status</label>
          <select
            id="complaint-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <label htmlFor="complaint-remarks">Remarks</label>
          <textarea
            id="complaint-remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Enter update remarks..."
            rows="3"
          />

          <div className="admin-modal-actions">
            <button type="button" className="admin-cancel-button" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="admin-save-button" disabled={updating}>
              {updating ? "Updating..." : "Save Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComplaintDetails;
