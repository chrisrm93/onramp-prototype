// Homebuyer pipeline: every tenant in a live property, ordered by when they'll have their
// down payment saved. These are the future clients of the Onramp Homes brokerage.
// Anyone late on rent this month is flagged, since a late payment can set back their credit and savings.
import { tenantProgress } from '../data/progress.js'
import { CURRENT_MONTH, dollars, monthLabel } from '../constants.js'

export default function HomebuyerPipeline({ data, onOpenTenant }) {
  const liveIds = data.properties.filter((p) => p.status === 'live').map((p) => p.id)
  // Soonest ready first; if two land in the same month, the one further along goes first.
  const rows = data.tenants
    .filter((t) => liveIds.includes(t.propertyId))
    .map((t) => ({
      tenant: t,
      ...tenantProgress(data, t),
      late: data.payments.filter((p) => p.tenantId === t.id && p.month === CURRENT_MONTH && p.status === 'late').length,
    }))
    .sort((a, b) => a.readyMonth.localeCompare(b.readyMonth) || b.pct - a.pct)

  return (
    <section className="card pipeline">
      <div className="pipeline-top">
        <h2>Homebuyer pipeline</h2>
        <span className="badge green">Future Onramp Homes clients</span>
      </div>
      <ol className="pipeline-list">
        {rows.map((r) => (
          <li key={r.tenant.id} className={r.late ? 'pipeline-row late' : 'pipeline-row'}>
            <div className="pipeline-who">
              <button className="name-link" onClick={() => onOpenTenant(r.tenant.id)}>{r.tenant.name}</button>
              <span className="muted small">{r.room.name}</span>
              {r.late > 0 && (
                <span className="badge red pipeline-flag">⚠ {r.late} late payment{r.late > 1 ? 's' : ''}, check in</span>
              )}
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
