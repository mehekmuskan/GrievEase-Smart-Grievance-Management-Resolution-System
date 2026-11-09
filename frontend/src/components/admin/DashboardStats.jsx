function DashboardStats({ stats }) {
  const cards = [
    { title: "Total Complaints", value: stats?.total_complaints ?? 0, icon: "01" },
    { title: "Pending Complaints", value: stats?.pending ?? 0, icon: "02" },
    { title: "Resolved Complaints", value: stats?.resolved ?? 0, icon: "03" },
    { title: "Overdue Complaints", value: stats?.overdue ?? 0, icon: "04" },
  ];

  return (
    <section className="admin-stats-grid">
      {cards.map((card) => (
        <div className="admin-stat-card" key={card.title}>
          <div className="admin-stat-icon">{card.icon}</div>
          <div>
            <p className="admin-stat-title">{card.title}</p>
            <h2 className="admin-stat-value">{card.value}</h2>
          </div>
        </div>
      ))}
    </section>
  );
}

export default DashboardStats;
