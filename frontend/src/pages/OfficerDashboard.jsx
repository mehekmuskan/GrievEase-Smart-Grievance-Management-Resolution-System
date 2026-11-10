
import { useState } from "react";
import "./OfficerDashboard.css";

const initialComplaints = [
  {
    id: "GRV-20261109-001",
    citizen: "Rahul Kumar",
    category: "Water Supply",
    location: "Bengaluru",
    date: "09 Nov 2026",
    priority: "High",
    status: "Pending",
    description: "Irregular water supply in our residential area.",
    remarks: "",
    followUp: "",
  },
  {
    id: "GRV-20261109-002",
    citizen: "Priya Sharma",
    category: "Roads",
    location: "Mysuru",
    date: "08 Nov 2026",
    priority: "Medium",
    status: "In Progress",
    description: "Road damage causing difficulty for commuters.",
    remarks: "Inspection is in progress.",
    followUp: "2026-11-12",
  },
  {
    id: "GRV-20261109-004",
    citizen: "Sneha Rao",
    category: "Sanitation",
    location: "Dharwad",
    date: "06 Nov 2026",
    priority: "Low",
    status: "Resolved",
    description: "Garbage collection was delayed in the area.",
    remarks: "Cleaning work completed.",
    followUp: "",
  },
];

function OfficerDashboard() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [filter, setFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const filteredComplaints = complaints.filter((complaint) => {
    return filter === "All" || complaint.status === filter;
  });

  const pending = complaints.filter(
    (c) => c.status === "Pending"
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;

  const resolved = complaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setRemarks(complaint.remarks);
    setFollowUp(complaint.followUp);
    setNewStatus(complaint.status);
  };

  const handleUpdate = () => {
    if (!selectedComplaint || !newStatus) return;

    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === selectedComplaint.id
          ? {
              ...complaint,
              status: newStatus,
              remarks,
              followUp,
            }
          : complaint
      )
    );

    setSelectedComplaint(null);
  };

  return (
    <div className="officer-layout">
      <aside className="officer-sidebar">
        <div className="officer-brand">
          <span>🏛️</span>
          <div>
            <h2>GrievEase</h2>
            <p>Officer Portal</p>
          </div>
        </div>

        <div className="officer-profile">
          <div className="officer-avatar">O</div>
          <div>
            <strong>Officer Anil Kumar</strong>
            <small>Field Officer</small>
          </div>
        </div>

        <nav className="officer-nav">
          <a href="#officer-overview" className="active">
            ▦ Dashboard
          </a>
          <a href="#assigned-complaints">
            ▤ My Complaints
          </a>
        </nav>

        <div className="officer-sidebar-footer">
          GrievEase © 2026
        </div>
      </aside>

      <main className="officer-main">
        <header className="officer-topbar">
          <div>
            <h1>Officer Dashboard</h1>
            <p>View and manage your assigned complaints.</p>
          </div>
          <span className="officer-role">Field Officer</span>
        </header>

        <section id="officer-overview" className="officer-welcome">
          <div>
            <h2>Welcome, Anil Kumar!</h2>
            <p>Here is your complaint management overview.</p>
          </div>
          <span>👨‍💼 Officer Portal</span>
        </section>

        <section className="officer-stats">
          <div className="officer-stat-card">
            <span className="officer-stat-icon blue">▤</span>
            <p>Assigned Complaints</p>
            <h2>{complaints.length}</h2>
          </div>

          <div className="officer-stat-card">
            <span className="officer-stat-icon orange">◷</span>
            <p>Pending</p>
            <h2>{pending}</h2>
          </div>

          <div className="officer-stat-card">
            <span className="officer-stat-icon purple">↻</span>
            <p>In Progress</p>
            <h2>{inProgress}</h2>
          </div>

          <div className="officer-stat-card">
            <span className="officer-stat-icon green">✓</span>
            <p>Resolved</p>
            <h2>{resolved}</h2>
          </div>
        </section>

        <section
          id="assigned-complaints"
          className="officer-complaints"
        >
          <div className="officer-section-heading">
            <div>
              <h2>My Assigned Complaints</h2>
              <p>Review complaints assigned to you.</p>
            </div>
          </div>

          <div className="officer-toolbar">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Complaints</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="officer-table-wrapper">
            <table className="officer-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Citizen</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.id}</td>
                    <td>{complaint.citizen}</td>
                    <td>{complaint.category}</td>
                    <td>{complaint.location}</td>
                    <td>
                      <span
                        className={`officer-priority ${complaint.priority.toLowerCase()}`}
                      >
                        {complaint.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`officer-status ${complaint.status.toLowerCase().replace(" ", "-")}`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="officer-update-btn"
                        onClick={() => openComplaint(complaint)}
                      >
                        View / Update
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan="7" className="officer-empty">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedComplaint && (
          <div className="officer-modal-overlay">
            <div className="officer-modal">
              <h2>Complaint Details</h2>

              <div className="officer-detail">
                <strong>Complaint ID:</strong>
                <span>{selectedComplaint.id}</span>
              </div>

              <div className="officer-detail">
                <strong>Citizen:</strong>
                <span>{selectedComplaint.citizen}</span>
              </div>

              <div className="officer-detail">
                <strong>Category:</strong>
                <span>{selectedComplaint.category}</span>
              </div>

              <div className="officer-detail">
                <strong>Location:</strong>
                <span>{selectedComplaint.location}</span>
              </div>

              <div className="officer-description">
                <strong>Complaint Description</strong>
                <p>{selectedComplaint.description}</p>
              </div>

              <label htmlFor="officer-new-status">
                Update Complaint Status
              </label>

              <select
                id="officer-new-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <label htmlFor="officer-remarks">
                Work Remarks
              </label>

              <textarea
                id="officer-remarks"
                rows="3"
                placeholder="Enter work progress or remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <label htmlFor="officer-followup">
                Next Follow-up Date
              </label>

              <input
                id="officer-followup"
                type="date"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
              />

              <div className="officer-modal-actions">
                <button
                  className="officer-cancel-btn"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>

                <button
                  className="officer-save-btn"
                  onClick={handleUpdate}
                >
                  Save Update
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OfficerDashboard;
