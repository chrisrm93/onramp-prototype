// Second row of manager KPIs: how much of this month's rent is in, what repairs have cost
// this year, and how quickly tickets get fixed. Covers every live property, like the row above.
import { CURRENT_MONTH, rentFor, dollars, monthSpan, daysToResolve } from '../constants.js'

export default function OperationsSummary({ data }) {
  const liveIds = data.properties.filter((p) => p.status === 'live').map((p) => p.id)

  // Rent: this month's amount from every tenant, and who hasn't paid it yet.
  const rows = data.tenants
    .filter((t) => liveIds.includes(t.propertyId))
    .map((t) => {
      const room = data.rooms.find((r) => r.id === t.roomId)
      const payment = data.payments.find((p) => p.tenantId === t.id && p.month === CURRENT_MONTH)
      return { tenant: t, rent: rentFor(room, t.leaseType), paid: payment?.status === 'paid', status: payment?.status ?? 'due' }
    })
  const due = rows.reduce((sum, r) => sum + r.rent, 0)
  const collected = rows.filter((r) => r.paid).reduce((sum, r) => sum + r.rent, 0)
  const rate = due ? Math.round((collected / due) * 100) : 100
  const unpaid = rows.filter((r) => !r.paid)

  // Maintenance: this year's tickets, total cost, and average per month since the first one.
  const year = CURRENT_MONTH.slice(0, 4)
  const tickets = data.maintenance.filter((m) => liveIds.includes(m.propertyId) && m.createdAt.startsWith(year))
  const spend = tickets.reduce((sum, m) => sum + (m.cost ?? 0), 0)
  const firstMonth = tickets.map((m) => m.createdAt.slice(0, 7)).sort()[0] ?? CURRENT_MONTH
  const perMonth = spend / monthSpan(firstMonth, CURRENT_MONTH).length
  const resolved = tickets.map(daysToResolve).filter((d) => d !== null)
  const avgDays = resolved.length ? resolved.reduce((a, b) => a + b, 0) / resolved.length : null

  return (
    <section className="stats stats-3">
      <div className="stat card">
        <div className="stat-label">Collected this month</div>
        <div className="stat-value">{dollars(collected)} <span className="stat-of">of {dollars(due)}</span></div>
        <div className="meter"><div className="meter-fill" style={{ width: `${rate}%` }} /></div>
        <div className="stat-note">
          {rate}% collected
          {unpaid.length > 0 && <> · <span className="stat-alert">{dollars(due - collected)} outstanding ({unpaid.map((r) => `${r.tenant.name}${r.status === 'late' ? ', late' : ''}`).join('; ')})</span></>}
        </div>
      </div>
      <div className="stat card">
        <div className="stat-label">Maintenance spend (YTD)</div>
        <div className="stat-value">{dollars(spend)}</div>
        <div className="stat-note">{dollars(perMonth)}/mo average · {tickets.length} tickets</div>
      </div>
      <div className="stat card">
        <div className="stat-label">Avg. days to resolve</div>
        <div className="stat-value">{avgDays === null ? '–' : avgDays.toFixed(1)}<span className="stat-of"> days</span></div>
        <div className="stat-note">across {resolved.length} completed {resolved.length === 1 ? 'ticket' : 'tickets'}</div>
      </div>
    </section>
  )
}
