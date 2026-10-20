// Apply for a room: the prospect fills in a short form and it lands in the manager's
// applications list (live, via the shared store). No real background check happens.
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../data/store.js'
import { MONTH_TO_MONTH_PREMIUM, monthlySavings, dollars } from '../constants.js'

export default function ApplyPage() {
  const [data, update] = useData()
  const { propertyId, roomId } = useParams()
  const property = data.properties.find((p) => p.id === propertyId)
  const room = data.rooms.find((r) => r.id === roomId && r.propertyId === propertyId)

  const [name, setName] = useState('')
  const [occupation, setOccupation] = useState('')
  const [leaseType, setLeaseType] = useState('6mo+')
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!property || !room) {
    return <div className="page"><h1>Room not found</h1></div>
  }

  const backLink = `/property/${property.id}`
  const rent = room.rent + (leaseType === 'month-to-month' ? MONTH_TO_MONTH_PREMIUM : 0)

  // Save the application so it shows up in the manager's list.
  function handleSubmit(e) {
    e.preventDefault()
    update((d) => {
      d.applicants.push({
        id: `a-${Date.now()}`,
        propertyId: property.id,
        roomId: room.id,
        name: name.trim(),
        occupation: occupation.trim(),
        leaseType,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      })
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="page narrow">
        <div className="card confirm">
          <div className="confirm-icon">✓</div>
          <h1>Application submitted</h1>
          <p className="muted">
            Thanks, {name.trim().split(' ')[0]}! The property manager at {property.name} will review your
            application for {room.name} and get back to you soon.
          </p>
          <Link to={backLink} className="button secondary">Back to listing</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page narrow">
      <Link to={backLink} className="back-link">← Back to {property.name}</Link>
      <h1>Apply for {room.name}</h1>
      <p className="muted">{property.name} · {property.address}</p>

      <div className="card apply-summary">
        <div>
          <div className="summary-label">Monthly rent</div>
          <div className="summary-value">{dollars(rent)}<span>/mo</span></div>
        </div>
        <div>
          <div className="summary-label">You save vs. a studio</div>
          <div className="summary-value green">{dollars(monthlySavings(rent))}<span>/mo</span></div>
        </div>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sam Okafor" />
        </label>

        <label>
          Occupation
          <input value={occupation} onChange={(e) => setOccupation(e.target.value)} required placeholder="Nurse at Salem Health" />
        </label>

        <fieldset>
          <legend>Lease type</legend>
          <label className="radio">
            <input type="radio" name="leaseType" checked={leaseType === '6mo+'} onChange={() => setLeaseType('6mo+')} />
            6 months or longer · {dollars(room.rent)}/mo
          </label>
          <label className="radio">
            <input type="radio" name="leaseType" checked={leaseType === 'month-to-month'} onChange={() => setLeaseType('month-to-month')} />
            Month-to-month · {dollars(room.rent + MONTH_TO_MONTH_PREMIUM)}/mo
          </label>
        </fieldset>

        <label className="checkbox">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          I consent to a background check. All residents at {property.name} are background checked.
        </label>

        <button type="submit" className="button" disabled={!consent}>Submit application</button>
      </form>
    </div>
  )
}
