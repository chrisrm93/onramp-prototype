// Homebuyer pipeline: every tenant in a live property, ordered by when they'll have their
// down payment saved. These are the future clients of the Onramp Homes brokerage.
import { tenantProgress } from '../data/progress.js'
import { dollars, monthLabel } from '../constants.js'

export default function HomebuyerPipeline({ data, onOpenTenant }) {
  const liveIds = data.properties.filter((p) => p.status === 'live').map((p) => p.id)
  // Soonest ready first; if two land in the same month, the one further along goes first.
  const rows = data.tenants
    .filter((t) => liveIds.includes(t.propertyId))
    .map((t) => ({ tenant: t, ...tenantProgress(data, t) }))
    .sort((a, b) => a.readyMonth.localeCompare(b.readyMonth) || b.pct - a.pct)

  return (
    <section className="card pipeline">
      <div className="pipeline-top">
        <h2>Homebuyer pipeline</h2>
        <span className="badge green">Future Onramp Homes clients</span>
      </div>
      <ol className="pipeline-list">
        {rows.map((r) => (
          <li key={r.tenant.id} className="pipeline-row">
            <div className="pipeline-who">
              <button className="name-link" onClick={() => onOpenTenant(r.tenant.id)}>{r.tenant.name}</button>
              <span className="muted small">{r.room.name}</span>
            </div>
            <div className="pipeline-progress">
              <div className="mini-bar"><div className="mini-bar-fill" style={{ width: `${r.pct}%` }} /></div>
              <span className="muted small">{Math.floor(r.pct)}% of {dollars(r.goal)}</span>
            </div>
            <div className="pipeline-ready">
              <span className="summary-label">Ready</span>
              <strong>{r.monthsLeft === 0 ? 'Now' : monthLabel(r.readyMonth)}</strong>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
