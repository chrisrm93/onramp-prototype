// Tours tab: this month's funnel, then upcoming tours the manager can confirm, reschedule,
// or mark completed, then past tours and how they turned out.
// Tours the renter books in the chat only carry a name, time, and "with current tenants",
// so the room, type, and occupation are filled in here from their chat and application.
import { useState } from 'react'
import { useData, makeMessage } from '../data/store.js'
import { formatSlot } from './Chat.jsx'
import { shortDate } from '../constants.js'
import TourFunnel from './TourFunnel.jsx'

const TYPES = {
  in_person: { label: 'In person', icon: '🏠' },
  with_tenants: { label: 'With current tenants', icon: '👋' },
  video: { label: 'Video', icon: '🎥' },
}
const STATUSES = {
  scheduled: { label: 'Scheduled', className: 'badge orange' },
  completed: { label: 'Completed', className: 'badge gray' },
  no_show: { label: 'No-show', className: 'badge red' },
  applied: { label: 'Applied', className: 'badge green' },
}

// One tour with the gaps filled in: its type, room, occupation, and whether it led to an application.
function describeTour(tour, data) {
  const inquiry = data.inquiries.find((i) => i.id === tour.inquiryId)
  const applicant = data.applicants.find((a) => a.id === tour.applicantId || (tour.inquiryId && a.inquiryId === tour.inquiryId))
  const room = data.rooms.find((r) => r.id === (tour.roomId ?? inquiry?.roomId ?? applicant?.roomId))
  return {
    ...tour,
    type: tour.type ?? (tour.withCurrentTenants ? 'with_tenants' : 'in_person'),
    occupation: tour.occupation ?? applicant?.occupation ?? null,
    roomName: room?.name ?? 'Any room',
    status: applicant ? 'applied' : tour.status,
    note: tour.note ?? (tour.inquiryId ? 'Booked by the renter in the chat.' : ''),
  }
}

export default function ToursList({ propertyId }) {
  const [data, update] = useData()
  const [rescheduling, setRescheduling] = useState(null) // id of the tour whose date picker is open
  const [newTime, setNewTime] = useState('')

  const tours = data.tours.filter((t) => t.propertyId === propertyId).map((t) => describeTour(t, data))
  const upcoming = tours.filter((t) => t.status === 'scheduled').sort((a, b) => a.dateTime.localeCompare(b.dateTime))
  const past = tours.filter((t) => t.status !== 'scheduled').sort((a, b) => b.dateTime.localeCompare(a.dateTime))

  // Change one tour, and if the renter booked it in the chat, tell them there too.
  function changeTour(id, change, chatNote) {
    update((d) => {
      const tour = d.tours.find((t) => t.id === id)
      change(tour)
      const thread = chatNote && d.inquiries.find((i) => i.id === tour.inquiryId)
      if (thread) thread.messages.push(makeMessage('system', chatNote(tour), { type: 'system' }))
    })
  }

  // Open the date picker on a tour, starting from its current time.
  function startReschedule(tour) {
    setRescheduling(tour.id)
    setNewTime(tour.dateTime.slice(0, 16))
  }

  // Save the new time. A moved tour needs confirming again.
  function saveReschedule(id) {
    changeTour(id, (t) => {
      t.dateTime = newTime
      t.confirmed = false
    }, (t) => `Tour rescheduled to ${formatSlot(t.dateTime)}`)
    setRescheduling(null)
  }

  return (
    <div className="list">
      <TourFunnel data={data} propertyId={propertyId} />

      <h2 className="section-heading">Upcoming <span className="muted small">{upcoming.length}</span></h2>
      {upcoming.length === 0 && <div className="card"><p className="muted">No upcoming tours.</p></div>}
      {upcoming.map((tour) => {
        const d = new Date(tour.dateTime)
        const overdue = d < new Date()
        return (
          <div key={tour.id} className="card tour-card">
            <div className="date-chip">
              <span className="date-chip-month">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
              <span className="date-chip-day">{d.getDate()}</span>
            </div>
            <div className="list-item-main">
              <div className="list-item-top">
                <span className="list-item-title">{tour.name}</span>
                {tour.confirmed ? <span className="badge green">✓ Confirmed</span> : <span className={STATUSES.scheduled.className}>{STATUSES.scheduled.label}</span>}
                {overdue && <span className="badge red">Time has passed</span>}
              </div>
              {tour.occupation && <div className="muted small">{tour.occupation}</div>}
              <div className="small tour-meta">
                <span>{formatSlot(tour.dateTime)}</span>
                <span>{tour.roomName}</span>
                <span>{TYPES[tour.type].icon} {TYPES[tour.type].label}</span>
              </div>
              {tour.note && <div className="tour-note">{tour.note}</div>}

              {rescheduling === tour.id ? (
                <div className="reschedule">
                  <input type="datetime-local" value={newTime} onChange={(e) => setNewTime(e.target.value)} aria-label="New tour time" />
                  <button className="button small-button" onClick={() => saveReschedule(tour.id)} disabled={!newTime}>Save</button>
                  <button className="button secondary small-button" onClick={() => setRescheduling(null)}>Cancel</button>
                </div>
              ) : (
                <div className="tour-actions">
                  {!tour.confirmed && (
                    <button className="button small-button" onClick={() => changeTour(tour.id, (t) => { t.confirmed = true }, (t) => `Tour confirmed for ${formatSlot(t.dateTime)}`)}>
                      Confirm
                    </button>
                  )}
                  <button className="button secondary small-button" onClick={() => startReschedule(tour)}>Reschedule</button>
                  <button className="button secondary small-button" onClick={() => changeTour(tour.id, (t) => { t.status = 'completed' })}>Mark completed</button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      <h2 className="section-heading">Past <span className="muted small">{past.length}</span></h2>
      {past.length === 0 ? (
        <div className="card"><p className="muted">No past tours yet.</p></div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Prospect</th>
                <th>Room</th>
                <th>Type</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {past.map((tour) => (
                <tr key={tour.id}>
                  <td>{shortDate(tour.dateTime)}</td>
                  <td>
                    <span className="strong">{tour.name}</span>
                    {tour.occupation && <div className="muted small">{tour.occupation}</div>}
                  </td>
                  <td>{tour.roomName}</td>
                  <td>{TYPES[tour.type].icon} {TYPES[tour.type].label}</td>
                  <td><span className={STATUSES[tour.status].className}>{STATUSES[tour.status].label}</span></td>
                  <td className="cell-wrap muted small">{tour.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
