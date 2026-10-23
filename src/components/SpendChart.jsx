// Bar chart of repair spend per month with the monthly budget as a dashed line,
// so the manager can see at a glance whether maintenance is running over or under.
// Plain HTML bars: one series, one color, hover a month to see its exact total.
import { dollars, monthLabel } from '../constants.js'

// months: [{ month: "2026-04", total: 185, count: 1 }]. budget: dollars per month.
export default function SpendChart({ months, budget }) {
  // Leave headroom above the taller of the budget line and the biggest month.
  const top = Math.max(budget, ...months.map((m) => m.total)) * 1.2
  const pct = (value) => `${(value / top) * 100}%`

  return (
    <div className="spend-chart" role="img" aria-label={`Repair spend by month, compared with a ${dollars(budget)} monthly budget`}>
      <div className="spend-plot">
        <div className="spend-budget" style={{ bottom: pct(budget) }}>
          <span className="spend-budget-label">Budget {dollars(budget)}/mo</span>
        </div>
        {months.map((m) => (
          <div key={m.month} className="spend-col" tabIndex={0}>
            <div className="spend-bar" style={{ height: pct(m.total) }} />
            <div className="spend-tip" style={{ bottom: `calc(${pct(m.total)} + 8px)` }}>
              <strong>{monthLabel(m.month)}</strong>
              <span>{dollars(m.total)} · {m.count} {m.count === 1 ? 'ticket' : 'tickets'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="spend-axis">
        {months.map((m) => <span key={m.month}>{monthLabel(m.month, 'short')}</span>)}
      </div>
    </div>
  )
}
