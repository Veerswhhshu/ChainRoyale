export default function StatsCard({ icon, value, label, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {trend && (
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.75rem',
          color: trend > 0 ? 'var(--secondary)' : 'var(--danger)'
        }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
