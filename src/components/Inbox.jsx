// Manager's inbox: the selected property's renter conversations on the left, the open chat on the right.
// New messages from the tenant tab show up here live.
import { useState } from 'react'
import { useData, makeMessage } from '../data/store.js'
import { ChatThread, ChatBox, formatSlot } from './Chat.jsx'
import TourOfferForm from './TourOfferForm.jsx'

// `threadId` opens a specific conversation first, e.g. from a tenant's profile.
export default function Inbox({ propertyId, threadId }) {
  const [data, update] = useData()
  // Newest activity first, so a just-sent renter message jumps to the top.
  const threads = data.inquiries
    .filter((i) => i.propertyId === propertyId)
    .sort((a, b) => lastAt(b).localeCompare(lastAt(a)))
  const [openId, setOpenId] = useState(threadId ?? null)
  const [offering, setOffering] = useState(false)
  const open = threads.find((t) => t.id === openId) ?? threads[0]
  const tour = open && data.tours.find((t) => t.inquiryId === open.id)
  const invited = open && open.messages.some((m) => m.type === 'apply_invite')

  // Look up names for display.
  function roomName(roomId) {
    return data.rooms.find((r) => r.id === roomId)?.name ?? 'General question'
  }
  function propertyName(propertyId) {
    return data.properties.find((p) => p.id === propertyId)?.name ?? ''
  }

  // Add the manager's reply and mark the thread as answered.
  function reply(text) {
    update((d) => {
      const t = d.inquiries.find((i) => i.id === open.id)
      t.messages.push(makeMessage('manager', text))
      t.status = 'replied'
    })
  }

  // Send tour times into the chat as a special message the renter can tap.
  function offerTour({ slots, withCurrentTenants }) {
    update((d) => {
      const t = d.inquiries.find((i) => i.id === open.id)
      t.messages.push(makeMessage('manager', 'Here are a few times that work for a tour. Tap the one that suits you best!', {
        type: 'tour_offer',
        slots,
        withCurrentTenants,
        chosenSlot: null,
      }))
      t.status = 'replied'
    })
    setOffering(false)
  }

  // After the tour, invite the renter to apply. They get an "Apply now" button in the chat.
  function inviteToApply() {
    update((d) => {
      const t = d.inquiries.find((i) => i.id === open.id)
      t.messages.push(makeMessage('manager', `Thanks for coming by! You're invited to apply for ${roomName(t.roomId)}. Tap below to start your application.`, {
        type: 'apply_invite',
      }))
      t.status = 'replied'
    })
  }

  // Switch conversations and close any half-filled tour form.
  function openThread(id) {
    setOpenId(id)
    setOffering(false)
  }

  if (threads.length === 0) {
    return <div className="card"><p className="muted">No messages yet.</p></div>
  }

  return (
    <div className="inbox card">
      <ul className="inbox-list">
        {threads.map((t) => (
          <li key={t.id}>
            <button className={t.id === open.id ? 'inbox-item active' : 'inbox-item'} onClick={() => openThread(t.id)}>
              <div className="inbox-item-top">
                <span className="inbox-name">{t.name}</span>
                {t.status === 'new' && <span className="badge orange">New</span>}
              </div>
              <div className="inbox-room">{roomName(t.roomId)} · {propertyName(t.propertyId)}</div>
              <div className="inbox-preview">{t.messages[t.messages.length - 1].text}</div>
            </button>
          </li>
        ))}
      </ul>

      <div className="inbox-chat">
        <div className="chat-header">
          <div className="chat-avatar renter">{initials(open.name)}</div>
          <div>
            <div className="chat-title">{open.name}</div>
            <div className="muted small">{roomName(open.roomId)} · {propertyName(open.propertyId)}</div>
          </div>
          {tour && <span className="badge green chat-header-badge">Tour booked · {formatSlot(tour.dateTime)}</span>}
        </div>
        <ChatThread messages={open.messages} viewer="manager" otherName={open.name} />
        {offering ? (
          <TourOfferForm onSend={offerTour} onCancel={() => setOffering(false)} />
        ) : (
          <div className="chat-actions">
            <button className="button secondary small-button" onClick={() => setOffering(true)}>
              📅 {tour ? 'Offer new tour times' : 'Offer tour times'}
            </button>
            {open.roomId && (
              <button className="button secondary small-button" onClick={inviteToApply} disabled={invited}>
                {invited ? '✓ Invited to apply' : '📝 Invite to apply'}
              </button>
            )}
          </div>
        )}
        <ChatBox onSend={reply} placeholder={`Reply to ${open.name.split(' ')[0]}…`} />
      </div>
    </div>
  )
}

// Time of the most recent message, used to sort the inbox.
function lastAt(thread) {
  return thread.messages[thread.messages.length - 1].sentAt
}

// "Alex Moreno" -> "AM", for the chat avatar.
function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
