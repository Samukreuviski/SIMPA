/** LoadingState.js — Skeleton loader enquanto dados carregam */
function LoadingState({ type = 'page' }) {
  if (type === 'kpis') return (
    <div className="kpi-grid">
      {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-kpi" />)}
    </div>
  );
  if (type === 'chart') return <div className="skeleton skeleton-chart" />;
  if (type === 'table') return (
    <div>
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton-row" />)}
    </div>
  );
  return (
    <div style={{ padding: '40px 0' }}>
      <div className="kpi-grid" style={{ marginBottom: 18 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-kpi" />)}
      </div>
      <div className="charts-grid">
        <div className="skeleton skeleton-chart" />
        <div className="skeleton skeleton-chart" />
      </div>
    </div>
  );
}

window.LoadingState = LoadingState;
