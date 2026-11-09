import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardStats from "../components/admin/DashboardStats";
import ComplaintsTable from "../components/admin/ComplaintsTable";
import ComplaintDetails from "../components/admin/ComplaintDetails";
import RemindersPanel from "../components/admin/RemindersPanel";
import EscalationsPanel from "../components/admin/EscalationsPanel";

import {
  getDashboardStats,
  getComplaints,
  getComplaintActions,
  getOverdueComplaints,
  getEscalatedComplaints,
  updateComplaintStatus,
} from "../services/dashboardService";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [actions, setActions] = useState([]);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // Logout administrator
  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminData");

    navigate("/admin-login", { replace: true });
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getDashboardStats(),
      getComplaints(),
      getOverdueComplaints(),
      getEscalatedComplaints(),
    ]);

    if (results[0].status === "fulfilled") {
      setStats(results[0].value);
    }

    if (results[1].status === "fulfilled") {
      setComplaints(results[1].value);
    } else {
      setError("Unable to load complaints. Check whether the backend is running.");
    }

    if (results[2].status === "fulfilled") {
      setOverdue(results[2].value);
    }

    if (results[3].status === "fulfilled") {
      setEscalations(results[3].value);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const openComplaint = async (complaint) => {
    setSelectedComplaint(complaint);
    setActions([]);

    try {
      const history = await getComplaintActions(complaint.id);
      setActions(history);
    } catch (err) {
      console.error("Unable to load action history:", err);
    }
  };

  const handleStatusUpdate = async (payload) => {
    if (!selectedComplaint) return;

    setUpdating(true);

    try {
      await updateComplaintStatus(selectedComplaint.id, payload);
      alert("Complaint status updated successfully!");

      setSelectedComplaint(null);
      await loadDashboard();
    } catch (err) {
      alert(err.message || "Unable to update complaint status.");
    } finally {
      setUpdating(false);
    }
  };

  const upcoming = complaints
    .filter((item) => {
      if (!item.next_follow_up) return false;

      const followUpDate = new Date(item.next_follow_up);
      const isFuture = followUpDate > new Date();
      const isActive = !["Resolved", "Rejected"].includes(item.status);

      return isFuture && isActive;
    })
    .sort(
      (a, b) =>
        new Date(a.next_follow_up) - new Date(b.next_follow_up)
    );

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">GRIEVANCE MANAGEMENT SYSTEM</p>
          <h1>Admin Dashboard</h1>
          <p>Monitor and manage citizen complaints.</p>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>

          <button
            className="admin-refresh-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <DashboardStats stats={stats} />

      <ComplaintsTable
        complaints={complaints}
        loading={loading}
        onView={openComplaint}
      />

      <RemindersPanel
        upcoming={upcoming}
        overdue={overdue}
      />

      <EscalationsPanel escalations={escalations} />

      {selectedComplaint && (
        <ComplaintDetails
          key={selectedComplaint.id}
          complaint={selectedComplaint}
          actions={actions}
          onClose={() => setSelectedComplaint(null)}
          onStatusUpdate={handleStatusUpdate}
          updating={updating}
        />
      )}
    </main>
  );
}

export default AdminDashboard;