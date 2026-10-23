// Maintenance tab: repair spend by month against the budget, then every ticket in a table
// with its cost and how long it took. The manager updates status from the table.
import { useData } from '../data/store.js'
import { CURRENT_MONTH, REPAIR_BUDGET_MONTHLY, dollars, shortDate, monthSpan, daysToResolve } from '../constants.js'
import SpendChart from './SpendChart.jsx'

const STATUS_LABELS = { open: 'Open', in_progress: 'In progress', done: 'Done' }

export default function MaintenanceList({ propertyId, onOpenTenant }) {
  const [data, update] = useData()
  const tickets = data.maintenance
    .filter((m) => m.propertyId === propertyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // Save the new status. Finishing a ticket stamps when it was resolved; reopening clears it.
  function setStatus(id, status) {
    update((d) => {
      const m = d.maintenance.find((x) => x.id === id)
      m.status = status
      m.resolvedAt = status === 'done' ? new Date().toISOString() : null
    })
  }

  if (tickets.length === 0) {
    return <div className="card"><p className="muted">No maintenance requests.</p></div>
  }

  // One bar per month from the first ticket through this month.
  const firstMonth = tickets[tickets.length - 1].createdAt.slice(0, 7)
  const months = monthSpan(firstMonth, CURRENT_MONTH).map((month) => {
    const inMonth = tickets.filter((m) => m.createdAt.startsWith(month))
    return { month, total: inMonth.reduce((sum, m) => sum + (m.cost ?? 0), 0), count: inMonth.length }
  })
  const average = months.reduce((sum, m) => sum + m.total, 0) / months.length
  const gap = REPAIR_BUDGET_MONTHLY - average

  return (
    <div className="list">
      <section className="card">
        <h2>Repair spend by month</h2>
        <SpendChart months={months} budget={REPAIR_BUDGET_MONTHLY} />
        <p className={gap >= 0 ? 'budget-line under' : 'budget-line over'}>
          Running {dollars(Math.abs(gap))}/month {gap >= 0 ? 'under' : 'over'} budget.
          <span className="muted"> Averaging {dollars(average)}/month against a {dollars(REPAIR_BUDGET_MONTHLY)} budget.</span>
        </p>
      </section>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Issue</th>
              <th>Room</th>
              <th>Category</th>
              <th className="num">Cost</th>
              <th className="num">Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((m) => {
              const room = data.rooms.find((r) => r.id === m.roomId)
              const tenant = data.tenants.find((t) => t.id === m.tenantId)
              const days = daysToResolve(m)
              return (
                <tr key={m.id} className={m.status === 'done' ? '' : 'row-open'}>
                  <td>{shortDate(m.createdAt)}</td>
                  <td className="strong cell-wrap">
                    {m.issue}
                    {m.vendor && <div className="muted small">{m.vendor}</div>}
                  </td>
                  <td>
                    {room?.name ?? m.location ?? '–'}
                    {tenant && <div><button className="name-link small" onClick={() => onOpenTenant(tenant.id)}>{tenant.name}</button></div>}
                  </td>
                  <td>{m.category ?? '–'}</td>
                  <td className="num">{m.cost == null ? <span className="muted">–</span> : dollars(m.cost)}</td>
                  <td className="num">{days ?? <span className="muted">–</span>}</td>
                  <td>
                    <select className={`status-select ${m.status}`} value={m.status} onChange={(e) => setStatus(m.id, e.target.value)} aria-label={`Status of ${m.issue}`}>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
