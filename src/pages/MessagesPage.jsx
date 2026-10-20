// The renter's side of the chat with property management.
// Replies from the manager tab appear here live, without a refresh.
import { Link } from 'react-router-dom'
import { useData, useSession, makeMessage } from '../data/store.js'
import { ChatThread, ChatBox, formatSlot } from '../components/Chat.jsx'

export default function MessagesPage() {
  const [data, update] = useData()
  const [session] = useSession()
  const thread = data.inquiries.find((i) => i.id === session.inquiryId)

  if (!thread) {
    return (
      <div className="page narrow">
        <div className="card confirm">
          <h1>No messages yet</h1>
          <p className="muted">Pick a room you like and send property management a message.</p>
          <Link to="/" className="button">Browse rooms</Link>
        </div>
      </div>
    )
  }

  const property = data.properties.find((p) => p.id === thread.propertyId)
  const room = data.rooms.find((r) => r.id === thread.roomId)
  const tour = data.tours.find((t) => t.inquiryId === thread.id)

  // Add the renter's message and flag the thread as needing a manager reply.
  function send(text) {
    update((d) => {
      const t = d.inquiries.find((i) => i.id === thread.id)
      t.messages.push(makeMessage('renter', text))
      t.status = 'new'
    })
  }

  // Renter tapped a tour time: book it (or move an existing booking) and post a notice in the chat.
  function pickSlot(messageId, slot) {
    update((d) => {
      const t = d.inquiries.find((i) => i.id === thread.id)
      const offer = t.messages.find((m) => m.id === messageId)
      offer.chosenSlot = slot

      const existing = d.tours.find((x) => x.inquiryId === t.id)
      if (existing) {
        existing.dateTime = slot
        existing.withCurrentTenants = offer.withCurrentTenants
      } else {
        d.tours.push({
          id: `tour-${Date.now()}`,
          propertyId: t.propertyId,
          inquiryId: t.id,
          name: t.name,
          dateTime: slot,
          withCurrentTenants: offer.withCurrentTenants,
          status: 'scheduled',
        })
      }

      const who = offer.withCurrentTenants ? ' with current tenants' : ''
      t.messages.push(makeMessage('system', `Tour booked for ${formatSlot(slot)}${who}`, { type: 'system' }))
      t.status = 'new'
    })
  }

  return (
    <div className="page narrow">
      <Link to={`/property/${property.id}`} className="back-link">← Back to {property.name}</Link>
      <div className="card chat-card">
        <div className="chat-header">
          <div className="chat-avatar">PM</div>
          <div>
            <div className="chat-title">{property.name} management</div>
            <div className="muted small">{room ? `About ${room.name}` : 'General question'}</div>
          </div>
        </div>
        {tour && (
          <div className="tour-banner">
            <span className="tour-banner-icon">📅</span>
            <div>
              <div className="tour-banner-title">Your tour: {formatSlot(tour.dateTime)}</div>
              <div className="muted small">
                {property.address}{tour.withCurrentTenants ? ' · with current tenants' : ''}
              </div>
            </div>
          </div>
        )}
        <ChatThread messages={thread.messages} viewer="renter" otherName="Property management" onPickSlot={pickSlot} />
        {thread.status === 'new' && (
          <p className="chat-waiting">Property management usually replies within a few hours.</p>
        )}
        <ChatBox onSend={send} />
      </div>
    </div>
  )
}
