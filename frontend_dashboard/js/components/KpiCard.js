/** KpiCard.js — Card de indicador chave de performance */
function KpiCard({ label, value, desc, variant, icon }) {
  return (
    <div className={`kpi-card${variant ? ' ' + variant : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value${variant ? ' ' + variant : ''}`}>{value ?? '—'}</div>
      <div className="kpi-desc">{desc}</div>
      {icon && <div className="kpi-icon">{icon}</div>}
    </div>
  );
}

window.KpiCard = KpiCard;

