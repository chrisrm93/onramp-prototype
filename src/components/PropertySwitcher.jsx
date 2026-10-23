// Property switcher: one card per property so the manager can pick which house to run.
// Coming-soon homes appear here too, to show the portfolio growing.
export default function PropertySwitcher({ properties, selectedId, onSelect }) {
  return (
    <div className="switcher" role="tablist" aria-label="Properties">
      {properties.map((p) => (
        <button
          key={p.id}
          role="tab"
          aria-selected={p.id === selectedId}
          className={p.id === selectedId ? 'switcher-item active' : 'switcher-item'}
          onClick={() => onSelect(p.id)}
        >
          <div className="switcher-top">
            <span className="switcher-name">{p.name}</span>
            {p.status === 'live'
              ? <span className="badge green">Live</span>
              : <span className="badge orange">Coming {p.opening}</span>}
          </div>
          <div className="muted small">{p.address}</div>
        </button>
      ))}
    </div>
  )
}
