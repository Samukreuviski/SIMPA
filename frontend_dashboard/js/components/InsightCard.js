/** InsightCard.js — Card de interpretação textual dos dados */
function InsightCard({ text, icon = '💡' }) {
  return (
    <div className="insight-card">
      <span className="insight-icon">{icon}</span>
      <p className="insight-text">{text}</p>
    </div>
  );
}

window.InsightCard = InsightCard;
