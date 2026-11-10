
import { useState } from "react";
import "./DepartmentDashboard.css";

const initialComplaints = [
  {
    id: "GRV-20261109-001",
    citizen: "Rahul Kumar",
    category: "Water Supply",
    location: "Bengaluru",
    date: "09 Nov 2026",
    priority: "High",
    status: "Pending",
    officer: "Not Assigned",
  },
  {
    id: "GRV-20261109-002",
    citizen: "Priya Sharma",
    category: "Roads",
    location: "Mysuru",
    date: "08 Nov 2026",
    priority: "Medium",
    status: "In Progress",
    officer: "Anil Kumar",
  },
  {
    id: "GRV-20261109-003",
    citizen: "Amit Patel",
    category: "Electricity",
    location: "Ballari",
    date: "07 Nov 2026",
    priority: "High",
    status: "Pending",
    officer: "Not Assigned",
  },
  {
    id: "GRV-20261109-004",
    citizen: "Sneha Rao",
    category: "Sanitation",
    location: "Dharwad",
    date: "06 Nov 2026",
    priority: "Low",
    status: "Resolved",
    officer: "Meena Rao",
  },
];

function DepartmentDashboard() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState("");

  const officers = ["Anil Kumar", "Meena Rao", "Ravi Kumar"];

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(search.toLowerCase()) ||
      complaint.citizen.toLowerCase().includes(search.toLowerCase()) ||
      complaint.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || complaint.status === filter;

    return matchesSearch && matchesFilter;
  });

  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === "Pending"
  ).length;
  const inProgress = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;
  const resolved = complaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  const handleAssignOfficer = () => {
    if (!selectedOfficer || !selectedComplaint) return;

    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === selectedComplaint.id
          ? { ...complaint, officer: selectedOfficer }
          : complaint
      )
    );

    setSelectedComplaint(null);
    setSelectedOfficer("");
  };

  return (
    <div className="department-layout">

      <aside className="department-sidebar">
        <div className="department-brand">
          <span>🏛️</span>
          <div>
            <h2>GrievEase</h2>
            <p>Management Portal</p>
          </div>
        </div>

        <div className="department-profile">
          <div className="department-avatar">D</div>
          <div>
            <strong>Department Admin</strong>
            <small>Department Portal</small>
          </div>
        </div>

        <nav className="department-nav">
          <a href="#overview" className="active">▦ Dashboard</a>
          <a href="#complaints">▤ All Complaints</a>
          <a href="#complaints">◷ Pending Complaints</a>
          <a href="#complaints">✓ Resolved Complaints</a>
        </nav>

        <div className="department-sidebar-footer">
          <span>GrievEase © 2026</span>
        </div>
      </aside>

      <main className="department-main">

        <header className="department-topbar">
          <div>
            <h1>Department Dashboard</h1>
            <p>Manage and monitor citizen grievances.</p>
          </div>
          <span className="department-role">Department Admin</span>
        </header>

        <section id="overview" className="department-welcome">
          <div>
            <h2>Welcome, Department Admin!</h2>
            <p>Here's an overview of your department's complaints.</p>
          </div>
          <span>📅 09 November 2026</span>
        </section>

        <section className="department-stats">

          <div className="department-stat-card">
            <span className="stat-icon blue">▤</span>
            <p>Total Complaints</p>
            <h2>{total}</h2>
          </div>

          <div className="department-stat-card">
            <span className="stat-icon orange">◷</span>
            <p>Pending</p>
            <h2>{pending}</h2>
          </div>

          <div className="department-stat-card">
            <span className="stat-icon purple">↻</span>
            <p>In Progress</p>
            <h2>{inProgress}</h2>
          </div>

          <div className="department-stat-card">
            <span className="stat-icon green">✓</span>
            <p>Resolved</p>
            <h2>{resolved}</h2>
          </div>

        </section>

        <section id="complaints" className="department-complaints">

          <div className="department-section-heading">
            <div>
              <h2>Complaint Management</h2>
              <p>View and manage citizen complaints.</p>
            </div>
          </div>

          <div className="department-toolbar">
            <input
              type="search"
              placeholder="Search complaint ID, citizen or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="department-table-wrapper">
            <table className="department-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Citizen</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Officer</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.id}</td>
                    <td>{complaint.citizen}</td>
                    <td>{complaint.category}</td>
                    <td>{complaint.date}</td>
                    <td>
                      <span className={`priority-badge ${complaint.priority.toLowerCase()}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`department-status ${complaint.status.toLowerCase().replace(" ", "-")}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>{complaint.officer}</td>
                    <td>
                      <button
                        className="department-assign-btn"
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setSelectedOfficer(
                            complaint.officer === "Not Assigned"
                              ? ""
                              : complaint.officer
                          );
                        }}
                      >
                        {complaint.officer === "Not Assigned"
                          ? "Assign"
                          : "Manage"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan="8" className="department-empty">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>

        {selectedComplaint && (
          <div className="department-modal-overlay">
            <div className="department-modal">
              <h2>Assign Officer</h2>

              <p>
                Complaint ID: <strong>{selectedComplaint.id}</strong>
              </p>

              <p>
                Citizen: <strong>{selectedComplaint.citizen}</strong>
              </p>

              <label htmlFor="officer-select">Select Officer</label>

              <select
                id="officer-select"
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
              >
                <option value="">Choose an officer</option>
                {officers.map((officer) => (
                  <option key={officer} value={officer}>
                    {officer}
                  </option>
                ))}
              </select>

              <div className="department-modal-actions">
                <button
                  className="department-cancel-btn"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>

                <button
                  className="department-save-btn"
                  onClick={handleAssignOfficer}
                  disabled={!selectedOfficer}
                >
                  Save Assignment
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default DepartmentDashboard;
