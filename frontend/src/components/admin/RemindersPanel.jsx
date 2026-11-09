function RemindersPanel({ upcoming = [], overdue = [] }) {
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
  };

  const renderList = (items, emptyMessage, dateLabel) => {
    if (items.length === 0) {
      return <p className="admin-empty">{emptyMessage}</p>;
    }

    return items.map((item) => (
      <div className="admin-reminder-item" key={item.id}>
        <div>
          <strong>{item.complaint_id}</strong>
          <p>{item.citizen_name}</p>
        </div>
        <div className="admin-reminder-date">
          <small>{dateLabel}</small>
          <span>
            {formatDate(item.next_follow_up)}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <h2>Follow-up Reminders</h2>
          <p>Monitor complaint follow-up schedules</p>
        </div>
      </div>

      <div className="admin-reminders-grid">
        <div>
          <h3>Upcoming Reminders ({upcoming.length})</h3>
          {renderList(upcoming, "No upcoming reminders.", "Follow-up")}
        </div>

        <div>
          <h3>Overdue Complaints ({overdue.length})</h3>
          {renderList(overdue, "No overdue complaints.", "Overdue since")}
        </div>
      </div>
    </section>
  );
}

export default RemindersPanel;
