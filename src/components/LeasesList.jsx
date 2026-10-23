// Leases tab: who has signed, when, and when each lease ends,
// so the manager can spot unsigned leases and plan renewals.
import { useData } from '../data/store.js'
import { LEASE_TERM_MONTHS, leaseEndDate, shortDate } from '../constants.js'

export default function LeasesList({ propertyId, onOpenTenant }) {
  const [data] = useData()
  const tenants = data.tenants.filter((t) => t.propertyId === propertyId)

  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Room</th>
            <th>Lease</th>
            <th>Starts</th>
            <th>Ends</th>
            <th>Signed</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => {
            const room = data.rooms.find((r) => r.id === t.roomId)
            const lease = data.leases.find((l) => l.tenantId === t.id)
            const monthToMonth = t.leaseType === 'month-to-month'
            return (
              <tr key={t.id}>
                <td className="strong"><button className="name-link" onClick={() => onOpenTenant(t.id)}>{t.name}</button></td>
                <td>{room.name}</td>
                <td>{monthToMonth ? 'Month-to-month' : `${LEASE_TERM_MONTHS} months`}</td>
                <td>{shortDate(t.leaseStart)}</td>
                <td>{monthToMonth ? 'Rolling' : shortDate(leaseEndDate(t.leaseStart))}</td>
                <td>
                  {lease
                    ? <span className="badge green">✓ {shortDate(lease.signedAt)}</span>
                    : <span className="badge orange">Awaiting signature</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
