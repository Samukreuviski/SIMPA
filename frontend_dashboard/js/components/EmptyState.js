/** EmptyState.js — Estado vazio elegante */
function EmptyState({ title = 'Sem dados', desc = '', onRetry }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <div className="empty-title">{title}</div>
      {desc && <div className="empty-desc">{desc}</div>}
      {onRetry && (
        <button className="retry-btn" onClick={onRetry} id="retry-btn">
          Tentar novamente
        </button>
      )}
    </div>
  );
}

window.EmptyState = EmptyState;

