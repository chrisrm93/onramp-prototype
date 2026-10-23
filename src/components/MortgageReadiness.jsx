// Mortgage readiness: a checklist of what a lender will want, with progress on each.
// Rent history and down payment come from the tenant's real payment data; the class and
// pre-approval aren't tracked in the prototype yet, so they show as not started.
import { LENDER_HISTORY_MONTHS, dollars } from '../constants.js'

export default function MortgageReadiness({ reportedMonths, saved, goal }) {
  const savedPct = Math.min(100, (saved / goal) * 100)
  const items = [
    {
      name: 'Rent history reported',
      detail: `${Math.min(reportedMonths, LENDER_HISTORY_MONTHS)} of ${LENDER_HISTORY_MONTHS} months`,
      note: `Many lenders look for ${LENDER_HISTORY_MONTHS}.`,
      progress: Math.min(1, reportedMonths / LENDER_HISTORY_MONTHS),
    },
    { name: 'Down payment saved', detail: `${Math.floor(savedPct)}% of ${dollars(goal)}`, progress: savedPct / 100 },
    { name: 'Homebuyer education class', detail: 'Not started', progress: 0 },
    { name: 'Lender pre-approval', detail: 'Not started', progress: 0 },
  ]
  const overall = Math.round((items.reduce((sum, item) => sum + item.progress, 0) / items.length) * 100)

  return (
    <section className="card home-card readiness">
      <div className="readiness-top">
        <h2>Mortgage readiness</h2>
        <span className="readiness-pct">{overall}% ready</span>
      </div>
      <div className="meter"><div className="meter-fill" style={{ width: `${overall}%` }} /></div>
      <ul className="readiness-list">
        {items.map((item) => {
          const state = item.progress >= 1 ? 'done' : item.progress > 0 ? 'started' : 'todo'
          return (
            <li key={item.name} className={`readiness-item ${state}`}>
              <span className="readiness-icon">{state === 'done' ? '✓' : ''}</span>
              <div className="readiness-body">
                <div className="readiness-row">
                  <span className="readiness-name">{item.name}</span>
                  <span className="readiness-detail">{item.detail}</span>
                </div>
                {state === 'started' && (
                  <div className="mini-bar"><div className="mini-bar-fill" style={{ width: `${item.progress * 100}%` }} /></div>
                )}
                {item.note && <div className="readiness-note">{item.note}</div>}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
