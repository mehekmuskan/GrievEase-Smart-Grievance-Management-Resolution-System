import { useMemo, useState } from "react";

function ComplaintsTable({ complaints = [], loading, onView }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const departments = [
    ...new Set(complaints.map((item) => item.department).filter(Boolean)),
  ];

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesSearch = (item.complaint_id || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesDepartment =
        !department || item.department === department;

      const matchesStatus = !status || item.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [complaints, search, department, status]);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <h2>All Complaints</h2>
          <p>View and manage citizen complaints</p>
        </div>
        <span className="admin-count">
          {filteredComplaints.length} complaints
        </span>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search complaint ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Citizen Name</th>
              <th>Category</th>
              <th>Department</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="admin-empty">
                  Loading complaints...
                </td>
              </tr>
            ) : filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-empty">
                  No complaints found.
                </td>
              </tr>
            ) : (
              filteredComplaints.map((item) => (
                <tr key={item.id}>
                  <td>{item.complaint_id}</td>
                  <td>{item.citizen_name}</td>
                  <td>{item.category}</td>
                  <td>{item.department || "Unassigned"}</td>
                  <td>
                    <span className={`admin-status status-${(item.status || "pending").toLowerCase().replace(/\s+/g, "-")}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>
                    <button
                      className="admin-view-button"
                      onClick={() => onView(item)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ComplaintsTable;
