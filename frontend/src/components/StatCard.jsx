export default function StatCard({ label, value, hint, style }) {
  return (
    <div className="stat-card" style={style}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  )
}
