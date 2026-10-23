// A small funnel for the current month: how many tours turned into applications,
// and how many applications turned into signed leases. Shows where prospects drop off.
import { CURRENT_MONTH, monthLabel } from '../constants.js'

export default function TourFunnel({ data, propertyId }) {
  const inMonth = (iso) => iso?.startsWith(CURRENT_MONTH)
  const tenantIds = data.tenants.filter((t) => t.propertyId === propertyId).map((t) => t.id)
  const steps = [
    { label: 'Tours', count: data.tours.filter((t) => t.propertyId === propertyId && inMonth(t.dateTime)).length },
    { label: 'Applications', count: data.applicants.filter((a) => a.propertyId === propertyId && inMonth(a.submittedAt)).length },
    { label: 'Leases signed', count: data.leases.filter((l) => tenantIds.includes(l.tenantId) && inMonth(l.signedAt)).length },
  ]
  const widest = Math.max(1, steps[0].count)

  return (
    <section className="card funnel">
      <h2>{monthLabel(CURRENT_MONTH, 'short')} funnel</h2>
      <div className="funnel-steps">
        {steps.map((s, i) => (
          <div key={s.label} className="funnel-group">
            {i > 0 && (
              <div className="funnel-rate" title={`${steps[i - 1].label} to ${s.label.toLowerCase()}`}>
                <span>{steps[i - 1].count ? Math.round((s.count / steps[i - 1].count) * 100) : 0}%</span>
                <span className="funnel-arrow">→</span>
              </div>
            )}
            <div className="funnel-step">
              <div className="funnel-count">{s.count}</div>
              <div className="funnel-label">{s.label}</div>
              <div className="funnel-bar"><div className="funnel-fill" style={{ width: `${(s.count / widest) * 100}%` }} /></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
