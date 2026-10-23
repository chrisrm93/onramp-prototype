// The lease to sign, shown inside the "Sign lease" step of Move in: the terms, the house rules,
// and a box to type your full name. Not a real e-signature. We just record the typed name and the time.
import { useState } from 'react'
import { useData, makeMessage } from '../data/store.js'
import { rentFor, monthlySavings, monthsToGoal, leaseEndDate, dollars, shortDate } from '../constants.js'

export default function LeaseForm({ tenant, inquiryId }) {
  const [data, update] = useData()
  const [signature, setSignature] = useState('')
  const property = data.properties.find((p) => p.id === tenant.propertyId)
  const room = data.rooms.find((r) => r.id === tenant.roomId)
  const rent = rentFor(room, tenant.leaseType)
  const monthToMonth = tenant.leaseType === 'month-to-month'
  const nameMatches = signature.trim().toLowerCase() === tenant.name.toLowerCase()

  // Record the signature and let the manager know in the chat.
  function sign(e) {
    e.preventDefault()
    update((d) => {
      if (d.leases.some((l) => l.tenantId === tenant.id)) return // already signed in another tab
      d.leases.push({ id: `l-${Date.now()}`, tenantId: tenant.id, signedAt: new Date().toISOString(), signedName: signature.trim() })
      const thread = d.inquiries.find((i) => i.id === inquiryId)
      if (thread) {
        thread.messages.push(makeMessage('system', `${tenant.name} signed the lease for ${room.name}`, { type: 'system' }))
      }
    })
  }

  return (
    <div className="lease-form">
      <dl className="terms">
        <dt>Tenant</dt><dd>{tenant.name}</dd>
        <dt>Home</dt><dd>{property.name}<br /><span className="muted small">{property.address}</span></dd>
        <dt>Room</dt><dd>{room.name}</dd>
        <dt>Monthly rent</dt><dd>{dollars(rent)}/mo, utilities and parking included</dd>
        <dt>Lease</dt><dd>{monthToMonth ? 'Month-to-month' : `Fixed term, ${shortDate(tenant.leaseStart)} to ${shortDate(leaseEndDate(tenant.leaseStart))}`}</dd>
        <dt>Move-in</dt><dd>{shortDate(tenant.leaseStart)}</dd>
      </dl>
      {property.houseRules.length > 0 && (
        <>
          <h3>House rules</h3>
          <ul className="check-list">
            {property.houseRules.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </>
      )}
      <div className="lease-savings">
        You'll save <strong>{dollars(monthlySavings(rent))}/mo</strong> vs. a Salem studio, enough for a down payment
        in about <strong>{monthsToGoal(rent, tenant.savingsGoal)} months</strong>. On-time rent is reported to the credit bureaus.
      </div>

      <form className="form" onSubmit={sign}>
        <label>
          Type your full name to sign
          <input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder={tenant.name} autoComplete="off" />
        </label>
        {signature && <div className="signature-display">{signature}</div>}
        {signature && !nameMatches && <p className="muted small">Type your name exactly as it appears on the lease: {tenant.name}</p>}
        <button type="submit" className="button" disabled={!nameMatches}>Sign lease</button>
      </form>
    </div>
  )
}
