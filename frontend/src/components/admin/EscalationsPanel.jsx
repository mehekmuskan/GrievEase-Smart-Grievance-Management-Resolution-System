function EscalationsPanel({ escalations = [] }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <h2>Escalated Complaints</h2>
          <p>Complaints requiring higher-level attention</p>
        </div>
        <span className="admin-count">
          {escalations.length} escalated
        </span>
      </div>

      {escalations.length === 0 ? (
        <p className="admin-empty">No escalated complaints currently.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Citizen</th>
                <th>Department</th>
                <th>Assigned Officer</th>
                <th>Escalation Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {escalations.map((item) => (
                <tr key={item.id}>
                  <td>{item.complaint_id}</td>
                  <td>{item.citizen_name}</td>
                  <td>{item.department || "Unassigned"}</td>
                  <td>{item.assigned_officer || "Unassigned"}</td>
                  <td>
                    <span className="admin-escalation-level">
                      Level {item.escalation_level}
                    </span>
                  </td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default EscalationsPanel;
