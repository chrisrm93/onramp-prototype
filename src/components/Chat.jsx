// Chat pieces shared by the renter's Messages page and the manager's Inbox,
// so both sides of the conversation look and behave the same.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// Show a timestamp like "Oct 18, 4:05 PM".
function formatTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// Show a tour slot like "Thu, Oct 22 · 5:30 PM".
export function formatSlot(dateTime) {
  const d = new Date(dateTime)
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} · ${time}`
}

// The message list. `viewer` ("renter" or "manager") decides which bubbles sit on the right.
// `onPickSlot` and `applyLink` are only passed on the renter side, which is what makes
// tour times tappable and turns an invite to apply into an "Apply now" button.
export function ChatThread({ messages, viewer, otherName, onPickSlot, applyLink }) {
  const endRef = useRef(null)

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length])

  return (
    <div className="chat-thread">
      {messages.map((m) => {
        if (m.type === 'system') {
          return <div key={m.id} className="chat-note">{m.text}</div>
        }
        const mine = m.from === viewer
        return (
          <div key={m.id} className={mine ? 'bubble-row mine' : 'bubble-row'}>
            <div className="bubble">
              <div className="bubble-text">{m.text}</div>
              {m.type === 'tour_offer' && <TourSlots message={m} onPickSlot={onPickSlot} />}
              {m.type === 'apply_invite' && (applyLink
                ? <Link to={applyLink} className="button bubble-button">Apply now →</Link>
                : viewer === 'manager' && <div className="bubble-note">📝 Invitation to apply sent</div>)}
              <div className="bubble-meta">{mine ? 'You' : otherName} · {formatTime(m.sentAt)}</div>
            </div>
          </div>
        )
      })}
      <div ref={endRef} />
    </div>
  )
}

// The tour times inside a tour-offer bubble. The renter taps one to book it;
// once one is chosen, it's marked and the rest are greyed out.
function TourSlots({ message, onPickSlot }) {
  const canPick = onPickSlot && !message.chosenSlot

  return (
    <div className="tour-slots">
      {message.withCurrentTenants && <div className="tour-with">👋 Meet your future housemates on this tour</div>}
      {message.slots.map((slot) => {
        const chosen = slot === message.chosenSlot
        return (
          <button
            key={slot}
            type="button"
            className={chosen ? 'tour-slot chosen' : 'tour-slot'}
            disabled={!canPick}
            onClick={() => onPickSlot(message.id, slot)}
          >
            {chosen && '✓ '}{formatSlot(slot)}
          </button>
        )
      })}
      {canPick && <div className="tour-hint">Tap a time to book your tour</div>}
    </div>
  )
}

// The box at the bottom of a chat for typing and sending a message.
export function ChatBox({ onSend, placeholder = 'Write a message…' }) {
  const [text, setText] = useState('')

  // Send on submit, ignore empty messages, then clear the box.
  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form className="chat-box" onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
      <button type="submit" className="button" disabled={!text.trim()}>Send</button>
    </form>
  )
}
