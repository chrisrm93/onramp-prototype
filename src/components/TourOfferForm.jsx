// Manager's "Offer tour times" panel in the Inbox: pick 2–3 times and send them
// into the chat, where the renter can tap one to book.
import { useState } from 'react'

// Suggest three upcoming times so the manager can usually just hit Send.
function suggestedSlots() {
  const picks = [
    { daysAhead: 1, hour: 17, minute: 30 },
    { daysAhead: 2, hour: 12, minute: 0 },
    { daysAhead: 3, hour: 10, minute: 0 },
  ]
  return picks.map(({ daysAhead, hour, minute }) => {
    const d = new Date()
    d.setDate(d.getDate() + daysAhead)
    d.setHours(hour, minute, 0, 0)
    return toLocalInput(d)
  })
}

// Format a Date the way <input type="datetime-local"> wants: "2026-10-22T17:30".
function toLocalInput(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function TourOfferForm({ onSend, onCancel }) {
  const [slots, setSlots] = useState(suggestedSlots)
  const [withCurrentTenants, setWithCurrentTenants] = useState(true)

  // Change one of the three time pickers.
  function setSlot(i, value) {
    setSlots((s) => s.map((old, j) => (j === i ? value : old)))
  }

  // Send only the times that were filled in, without duplicates.
  function handleSubmit(e) {
    e.preventDefault()
    onSend({ slots: [...new Set(slots.filter(Boolean))], withCurrentTenants })
  }

  return (
    <form className="tour-offer-form" onSubmit={handleSubmit}>
      <div className="tour-offer-title">Offer tour times</div>
      <div className="tour-offer-slots">
        {slots.map((slot, i) => (
          <input key={i} type="datetime-local" value={slot} onChange={(e) => setSlot(i, e.target.value)} />
        ))}
      </div>
      <label className="checkbox">
        <input type="checkbox" checked={withCurrentTenants} onChange={(e) => setWithCurrentTenants(e.target.checked)} />
        Tour with current tenants
      </label>
      <div className="tour-offer-actions">
        <button type="button" className="button secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button" disabled={!slots.some(Boolean)}>Send times</button>
      </div>
    </form>
  )
}
