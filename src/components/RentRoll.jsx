// Rent roll: each tenant's rent and whether this month is paid, with late payers
// highlighted. "Send reminder" only shows a confirmation; nothing is actually sent.
import { useState } from 'react'
import { useData } from '../data/store.js'
import { CURRENT_MONTH, rentFor, dollars, monthLabel } from '../constants.js'

// Badge text and color for each payment status.
const STATUS = {
  paid: { label: 'Paid', className: 'badge green' },
  late: { label: 'Late', className: 'badge red' },
  due: { label: 'Due', className: 'badge gray' },
}

export default function RentRoll({ propertyId, onOpenTenant }) {
  const [data] = useData()
  const [reminded, setReminded] = useState([])
  const monthName = monthLabel(CURRENT_MONTH)

  const rows = data.tenants
    .filter((t) => t.propertyId === propertyId)
    .map((t) => {
      const room = data.rooms.find((r) => r.id === t.roomId)
      const payment = data.payments.find((p) => p.tenantId === t.id && p.month === CURRENT_MONTH)
      return { tenant: t, room, rent: rentFor(room, t.leaseType), status: payment?.status ?? 'due' }
    })
  const expected = rows.reduce((sum, r) => sum + r.rent, 0)
  const collected = rows.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.rent, 0)

  return (
    <div className="card table-wrap">
      <div className="table-heading">
        <h2>{monthName}</h2>
        <span className="muted small">Collected {dollars(collected)} of {dollars(expected)}</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Room</th>
            <th>Rent</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ tenant, room, rent, status }) => (
            <tr key={tenant.id} className={status === 'late' ? 'row-late' : ''}>
              <td className="strong"><button className="name-link" onClick={() => onOpenTenant(tenant.id)}>{tenant.name}</button></td>
              <td>{room.name}</td>
              <td>{dollars(rent)}</td>
              <td><span className={STATUS[status].className}>{STATUS[status].label}</span></td>
              <td className="cell-action">
                {status !== 'paid' && (reminded.includes(tenant.id)
                  ? <span className="reminder-sent">✓ Reminder sent to {tenant.name.split(' ')[0]}</span>
                  : <button className="button secondary small-button" onClick={() => setReminded([...reminded, tenant.id])}>Send reminder</button>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
