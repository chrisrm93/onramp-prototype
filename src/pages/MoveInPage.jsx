// Move in: every step between picking a room and getting the keys, on one page and in order.
// Steps check off live as the manager acts in the other tab, and the current one says what to do next.
import { Link } from 'react-router-dom'
import { useData, useSession } from '../data/store.js'
import { getViewer } from '../data/viewer.js'
import { rentFor, monthlySavings, dollars, shortDate } from '../constants.js'
import { formatSlot } from '../components/Chat.jsx'
import LeaseForm from '../components/LeaseForm.jsx'

export default function MoveInPage() {
  const [data] = useData()
  const [session] = useSession()
  const { inquiry, tour, applicant, tenant, lease } = getViewer(data, session)
  const room = data.rooms.find((r) => r.id === (tenant?.roomId ?? applicant?.roomId ?? inquiry?.roomId))
  const property = data.properties.find((p) => p.id === (room?.propertyId ?? inquiry?.propertyId))
  const tourOffered = inquiry?.messages.some((m) => m.type === 'tour_offer' && !m.chosenSlot)
  const invited = inquiry?.messages.some((m) => m.type === 'apply_invite')
  const approved = applicant?.status === 'approved' || !!tenant
  const rejected = applicant?.status === 'rejected'

  // Each step is done once it, or anything after it, has happened.
  const done = [!!tour || !!applicant || !!tenant, !!applicant || !!tenant, approved, !!lease]
  const current = done.indexOf(false) // -1 once everything is done

  const steps = [
    {
      name: 'Book a tour',
      done: tour
        ? `Tour booked for ${formatSlot(tour.dateTime)}${tour.withCurrentTenants ? ' with current tenants' : ''}.`
        : 'Tour complete.',
      current: (
        <>
          <p>{tourOffered
            ? 'Property management sent you a few tour times. Pick the one that works for you.'
            : 'Property management will send you a few tour times in Messages.'}</p>
          <Link to="/messages" className="button">{tourOffered ? 'Pick a tour time' : 'Open Messages'}</Link>
        </>
      ),
      upcoming: 'See the home and meet your future housemates.',
    },
    {
      name: 'Apply',
      done: applicant ? `Applied on ${shortDate(applicant.submittedAt)}.` : 'Application complete.',
      current: invited && room ? (
        <>
          <p>You're invited to apply for {room.name}. It takes about a minute.</p>
          <Link to={`/property/${room.propertyId}/apply/${room.id}`} className="button">Apply now</Link>
        </>
      ) : (
        <p>After your tour, property management will invite you to apply.</p>
      ),
      upcoming: 'A short form and a background check consent.',
    },
    {
      name: 'Application status',
      done: `Approved. Welcome to ${property?.name}!`,
      current: rejected
        ? <p>Your application wasn't approved this time. Message property management with any questions.</p>
        : <p><span className="badge orange">Submitted</span> Property management is reviewing your application.</p>,
      upcoming: "We'll let you know as soon as there's a decision.",
    },
    {
      name: 'Sign lease',
      done: lease && `Signed by ${lease.signedName} on ${shortDate(lease.signedAt)}.`,
      current: tenant && <LeaseForm tenant={tenant} inquiryId={applicant?.inquiryId} />,
      upcoming: 'Review your lease and sign online.',
    },
  ]

  return (
    <div className="page move-in">
      <h1>Move in</h1>
      <p className="muted">Tour, apply, and sign, all in one place. Each step checks off as it happens.</p>

      {room && (
        <div className="card apply-summary">
          <div>
            <div className="summary-label">{room.name} · {property.name}</div>
            <div className="summary-value">{dollars(rentFor(room, tenant?.leaseType ?? applicant?.leaseType))}<span>/mo</span></div>
          </div>
          <div>
            <div className="summary-label">You save vs. a studio</div>
            <div className="summary-value green">{dollars(monthlySavings(rentFor(room, tenant?.leaseType ?? applicant?.leaseType)))}<span>/mo</span></div>
          </div>
        </div>
      )}

      <ol className="steps">
        {steps.map((s, i) => {
          const state = done[i] ? 'done' : i === current ? 'current' : 'upcoming'
          return (
            <li key={s.name} className={`step step-${state}${state === 'current' && rejected && i === 2 ? ' step-stopped' : ''}`}>
              <span className="step-icon">{state === 'done' ? '✓' : i + 1}</span>
              <div className="step-body">
                <div className="step-name">{s.name}</div>
                {state === 'done' && <p className="muted">{s.done}</p>}
                {state === 'current' && s.current}
                {state === 'upcoming' && <p className="muted">{s.upcoming}</p>}
              </div>
            </li>
          )
        })}
      </ol>

      {lease && (
        <div className="card confirm">
          <div className="confirm-icon">🏡</div>
          <h2>You're moved in</h2>
          <p className="muted">Every on-time rent payment now builds your credit and your down payment.</p>
          <Link to="/home" className="button">Go to My Home →</Link>
        </div>
      )}
    </div>
  )
}
