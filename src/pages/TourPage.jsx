// Book a tour straight from the listing: the prospect picks a time and whether to meet the
// current tenants. The tour shows up live in the manager's Tours tab, and a chat thread is
// started (or reused) so the manager can follow up and invite them to apply.
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData, useSession, makeMessage } from '../data/store.js'
import { getViewer } from '../data/viewer.js'
import { monthlySavings, dollars } from '../constants.js'
import { formatSlot } from '../components/Chat.jsx'
import { suggestedSlots } from '../components/TourOfferForm.jsx'

export default function TourPage() {
  const [data, update] = useData()
  const [session, updateSession] = useSession()
  const navigate = useNavigate()
  const { propertyId, roomId } = useParams()
  const property = data.properties.find((p) => p.id === propertyId)
  const room = data.rooms.find((r) => r.id === roomId && r.propertyId === propertyId)
  // Booking always happens as the live renter, so use their chat and name if they have one.
  const live = getViewer(data, { ...session, viewAs: null })

  const [slots] = useState(suggestedSlots)
  const [name, setName] = useState(live.name ?? '')
  const [slot, setSlot] = useState('')
  const [withCurrentTenants, setWithCurrentTenants] = useState(true)

  if (!property || !room) {
    return <div className="page"><h1>Room not found</h1></div>
  }

  // Save the tour, note it in the renter's chat (starting one if needed), then show the Move in steps.
  function handleSubmit(e) {
    e.preventDefault()
    const inquiryId = live.inquiry?.id ?? `i-${Date.now()}`
    const who = withCurrentTenants ? ' with current tenants' : ''
    update((d) => {
      let thread = d.inquiries.find((i) => i.id === inquiryId)
      if (!thread) {
        thread = { id: inquiryId, propertyId: property.id, roomId: room.id, name: name.trim(), status: 'new', messages: [] }
        d.inquiries.push(thread)
      }
      thread.roomId = room.id
      thread.messages.push(makeMessage('system', `${thread.name} booked a tour of ${room.name} for ${formatSlot(slot)}${who}`, { type: 'system' }))
      thread.status = 'new'

      const existing = d.tours.find((t) => t.inquiryId === inquiryId)
      if (existing) {
        existing.dateTime = slot
        existing.withCurrentTenants = withCurrentTenants
        existing.roomId = room.id
        existing.confirmed = false
      } else {
        d.tours.push({
          id: `tour-${Date.now()}`,
          propertyId: property.id,
          inquiryId,
          name: thread.name,
          roomId: room.id,
          dateTime: slot,
          withCurrentTenants,
          status: 'scheduled',
        })
      }
      // If they already applied without a chat, link the application to this thread.
      const app = live.applicant && d.applicants.find((a) => a.id === live.applicant.id)
      if (app && !app.inquiryId) app.inquiryId = inquiryId
    })
    updateSession({ inquiryId, viewAs: null })
    navigate('/move-in')
  }

  return (
    <div className="page narrow">
      <Link to={`/property/${property.id}`} className="back-link">← Back to {property.name}</Link>
      <h1>Book a tour of {room.name}</h1>
      <p className="muted">{property.name} · {property.address}</p>

      <div className="card apply-summary">
        <div>
          <div className="summary-label">{room.name}</div>
          <div className="summary-value">{dollars(room.rent)}<span>/mo</span></div>
        </div>
        <div>
          <div className="summary-label">You save vs. a studio</div>
          <div className="summary-value green">{dollars(monthlySavings(room.rent))}<span>/mo</span></div>
        </div>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        {!live.name && (
          <label>
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sam Okafor" />
          </label>
        )}

        <fieldset>
          <legend>Pick a time</legend>
          <div className="tour-slots">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                className={s === slot ? 'tour-slot chosen' : 'tour-slot'}
                onClick={() => setSlot(s)}
              >
                {s === slot && '✓ '}{formatSlot(s)}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="checkbox">
          <input type="checkbox" checked={withCurrentTenants} onChange={(e) => setWithCurrentTenants(e.target.checked)} />
          Tour with current tenants. Meet your future housemates.
        </label>

        <button type="submit" className="button" disabled={!slot || !name.trim()}>Confirm tour</button>
      </form>
    </div>
  )
}
