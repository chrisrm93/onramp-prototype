// Applications tab: the manager reviews each applicant and approves or rejects them.
// Approving moves the applicant into the room as a tenant, so occupancy updates everywhere.
import { useData, makeMessage } from '../data/store.js'
import { CURRENT_MONTH, SAVINGS_GOAL, rentFor, dollars, shortDate } from '../constants.js'

export default function Applications({ propertyId }) {
  const [data, update] = useData()
  // Pending applications first, newest first within each group.
  const apps = data.applicants
    .filter((a) => a.propertyId === propertyId)
    .sort((a, b) => (a.status === 'submitted') === (b.status === 'submitted')
      ? b.submittedAt.localeCompare(a.submittedAt)
      : a.status === 'submitted' ? -1 : 1)

  // Turn the applicant into a tenant: fill the room and open this month's rent.
  function approve(id) {
    update((d) => {
      const app = d.applicants.find((a) => a.id === id)
      const room = d.rooms.find((r) => r.id === app.roomId)
      if (room.status !== 'available') return // the other tab may have filled it already
      const tenantId = `t-${Date.now()}`
      app.status = 'approved'
      app.tenantId = tenantId // lets the renter find their lease to sign
      room.status = 'occupied'
      d.tenants.push({
        id: tenantId,
        propertyId: app.propertyId,
        roomId: room.id,
        name: app.name,
        occupation: app.occupation,
        leaseStart: new Date().toLocaleDateString('en-CA'), // today as "YYYY-MM-DD"
        leaseType: app.leaseType,
        savingsGoal: SAVINGS_GOAL,
        isDemoTenant: false,
      })
      d.payments.push({
        id: `pay-${tenantId}-${CURRENT_MONTH}`,
        tenantId,
        month: CURRENT_MONTH,
        amount: rentFor(room, app.leaseType),
        status: 'due',
        reportedToCredit: false,
      })
      // If they applied from the chat, tell them there what comes next.
      const thread = d.inquiries.find((i) => i.id === app.inquiryId)
      if (thread) {
        thread.messages.push(makeMessage('system', `Application approved for ${room.name}. Next step: sign your lease.`, { type: 'system' }))
      }
    })
  }

  // Decline the application. The room stays open for others.
  function reject(id) {
    update((d) => {
      d.applicants.find((a) => a.id === id).status = 'rejected'
    })
  }

  if (apps.length === 0) {
    return <div className="card"><p className="muted">No applications yet.</p></div>
  }

  return (
    <div className="list">
      {apps.map((app) => {
        const room = data.rooms.find((r) => r.id === app.roomId)
        const roomFilled = room.status !== 'available'
        return (
          <div key={app.id} className={app.status === 'submitted' ? 'card list-item' : 'card list-item done'}>
            <div className="list-item-main">
              <div className="list-item-title">{app.name}</div>
              <div className="muted small">{app.occupation}</div>
              <div className="small">
                {room.name} · {app.leaseType === 'month-to-month' ? 'Month-to-month' : '6 months or longer'} · {dollars(rentFor(room, app.leaseType))}/mo
              </div>
              <div className="muted small">Applied {shortDate(app.submittedAt)} · Background check consent given</div>
            </div>
            <div className="list-item-actions">
              {app.status === 'submitted' ? (
                <>
                  <button className="button secondary" onClick={() => reject(app.id)}>Reject</button>
                  <button className="button" onClick={() => approve(app.id)} disabled={roomFilled}>Approve</button>
                  {roomFilled && <div className="muted small">{room.name} is already filled</div>}
                </>
              ) : (
                <span className={app.status === 'approved' ? 'badge green' : 'badge gray'}>
                  {app.status === 'approved' ? 'Approved · moved in' : 'Rejected'}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
