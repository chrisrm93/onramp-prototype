// First contact: a prospect who likes a room messages property management.
// This starts a chat thread that shows up live in the manager's Inbox.
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData, useSession, makeMessage } from '../data/store.js'
import { monthlySavings, dollars } from '../constants.js'

export default function ContactPage() {
  const [data, update] = useData()
  const [session, updateSession] = useSession()
  const navigate = useNavigate()
  const { propertyId, roomId } = useParams()
  const property = data.properties.find((p) => p.id === propertyId)
  const room = data.rooms.find((r) => r.id === roomId && r.propertyId === propertyId)
  const existing = data.inquiries.find((i) => i.id === session.inquiryId)

  const [name, setName] = useState('')
  const [message, setMessage] = useState(
    room ? `Hi! I'm interested in ${room.name}. Could I set up a tour?` : ''
  )

  if (!property || !room) {
    return <div className="page"><h1>Room not found</h1></div>
  }

  // Start a new conversation, or add to this renter's existing one, then open the chat.
  function handleSubmit(e) {
    e.preventDefault()
    const msg = makeMessage('renter', message.trim())
    if (existing) {
      update((d) => {
        const thread = d.inquiries.find((i) => i.id === existing.id)
        thread.messages.push(msg)
        thread.roomId = room.id
        thread.status = 'new'
      })
    } else {
      const id = `i-${Date.now()}`
      update((d) => {
        d.inquiries.push({
          id,
          propertyId: property.id,
          roomId: room.id,
          name: name.trim(),
          status: 'new',
          messages: [msg],
        })
      })
      updateSession({ inquiryId: id })
    }
    navigate('/messages')
  }

  return (
    <div className="page narrow">
      <Link to={`/property/${property.id}`} className="back-link">← Back to {property.name}</Link>
      <h1>Message property management</h1>
      <p className="muted">Ask a question or set up a tour of {room.name} at {property.name}.</p>

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
        {!existing && (
          <label>
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sam Okafor" />
          </label>
        )}
        <label>
          Message
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} />
        </label>
        <button type="submit" className="button" disabled={!message.trim()}>Send message</button>
      </form>
    </div>
  )
}
