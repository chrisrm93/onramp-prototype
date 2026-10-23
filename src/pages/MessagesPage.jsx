// The renter's side of the chat with property management, for whoever the sidebar is viewing as.
// Replies from the manager tab appear here live, without a refresh.
import { Link } from 'react-router-dom'
import { useData, useSession, makeMessage } from '../data/store.js'
import { getViewer } from '../data/viewer.js'
import { ChatThread, ChatBox, formatSlot } from '../components/Chat.jsx'

export default function MessagesPage() {
  const [data, update] = useData()
  const [session] = useSession()
  const { inquiry: thread, applicant, tenant } = getViewer(data, session)
  // An applicant or tenant we already know, even if they haven't chatted with us yet.
  const known = tenant ?? applicant

  // Only a brand-new renter gets pointed back to the listing.
  if (!thread && !known) {
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

  const property = data.properties.find((p) => p.id === (thread?.propertyId ?? known.propertyId))
  const room = data.rooms.find((r) => r.id === (thread?.roomId ?? known.roomId))
  const tour = thread && data.tours.find((t) => t.inquiryId === thread.id)

  // Add the renter's message and flag the thread as needing a manager reply.
  // A known applicant or tenant without a chat yet starts one with their first message.
  function send(text) {
    update((d) => {
      let t = thread && d.inquiries.find((i) => i.id === thread.id)
      if (!t) {
        t = { id: `i-${Date.now()}`, propertyId: known.propertyId, roomId: known.roomId, tenantId: tenant?.id ?? null, name: known.name, status: 'new', messages: [] }
        d.inquiries.push(t)
        if (applicant) d.applicants.find((a) => a.id === applicant.id).inquiryId = t.id
      }
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
      {applicant && <ApplicationBanner applicant={applicant} data={data} />}
      <div className="card chat-card">
        <div className="chat-header">
          <div className="chat-avatar">PM</div>
          <div>
            <div className="chat-title">{property.name} management</div>
            <div className="muted small">{tenant ? `Your room: ${room.name}` : room ? `About ${room.name}` : 'General question'}</div>
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
        {thread ? (
          <ChatThread
            messages={thread.messages}
            viewer="renter"
            otherName="Property management"
            onPickSlot={pickSlot}
            applyLink={room && !known ? `/property/${property.id}/apply/${room.id}` : null}
          />
        ) : (
          <div className="chat-thread chat-empty">
            <p className="muted">No messages yet. Ask property management anything{tenant ? ' about your home' : ' about your application'}.</p>
          </div>
        )}
        {thread?.status === 'new' && (
          <p className="chat-waiting">Property management usually replies within a few hours.</p>
        )}
        <ChatBox onSend={send} />
      </div>
    </div>
  )
}

// Where the renter's application stands, with a link to the next step.
function ApplicationBanner({ applicant, data }) {
  const tenant = data.tenants.find((t) => t.id === applicant.tenantId)
  const lease = tenant && data.leases.find((l) => l.tenantId === tenant.id)

  if (lease) {
    return (
      <Link to="/home" className="status-banner green">
        🏡 Lease signed. Welcome home! <span>Open My Home →</span>
      </Link>
    )
  }
  if (applicant.status === 'approved') {
    return (
      <Link to="/move-in" className="status-banner green">
        🎉 You're approved! <span>Sign your lease →</span>
      </Link>
    )
  }
  if (applicant.status === 'rejected') {
    return <div className="status-banner gray">Your application wasn't approved this time.</div>
  }
  return <div className="status-banner">📝 Application submitted. Property management is reviewing it.</div>
}
