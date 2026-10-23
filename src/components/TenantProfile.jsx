// Tenant profile: a panel that slides in from the right when the manager clicks a tenant's name.
// Everything about one tenant in one place: lease, contact, payments, homebuying progress,
// documents, maintenance, and a link to their chat. Contact details and documents are placeholders.
import { useEffect, useState } from 'react'
import { useData } from '../data/store.js'
import { tenantProgress, ROAD_MAP_STAGES } from '../data/progress.js'
import { leaseEndDate, dollars, shortDate, monthLabel } from '../constants.js'
import PaymentRow from './PaymentRow.jsx'

const TICKET_LABELS = { open: 'Open', in_progress: 'In progress', done: 'Done' }

// Made-up contact details, built from the name so they stay the same every time.
// example.com and 555-01xx are reserved for fiction, so these can never reach a real person.
function fakeContact(name) {
  const handle = name.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.')
  const digits = String([...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 100).padStart(2, '0')
  return { email: `${handle}@example.com`, phone: `(503) 555-01${digits}` }
}

// "Jordan Reyes" -> "JR", for the avatar.
function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function TenantProfile({ tenantId, onClose, onOpenThread }) {
  const [data] = useData()
  const [openDoc, setOpenDoc] = useState(null)
  const tenant = data.tenants.find((t) => t.id === tenantId)

  // Close on Escape, like any side panel.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!tenant) return null

  const p = tenantProgress(data, tenant)
  const lease = data.leases.find((l) => l.tenantId === tenant.id)
  const contact = fakeContact(tenant.name)
  const monthToMonth = tenant.leaseType === 'month-to-month'
  const tickets = data.maintenance
    .filter((m) => m.tenantId === tenant.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const applicant = data.applicants.find((a) => a.tenantId === tenant.id)
  const thread = data.inquiries.find((i) => i.tenantId === tenant.id || i.id === applicant?.inquiryId)

  // The tenant's file. Only the lease status comes from data; the rest are demo placeholders.
  const documents = [
    { name: 'Signed lease', status: lease ? 'Signed' : 'Awaiting signature', ok: !!lease, detail: lease ? `Signed by ${lease.signedName} on ${shortDate(lease.signedAt)}` : 'Sent to tenant, not signed yet' },
    { name: 'Photo ID', status: 'Verified', ok: true, detail: 'Government-issued ID, checked at application' },
    { name: 'Background check', status: 'Passed', ok: true, detail: 'All residents are background checked' },
    { name: 'Proof of income', status: 'Verified', ok: true, detail: `Employment: ${tenant.occupation}` },
  ]
  const doc = documents.find((d) => d.name === openDoc)

  return (
    <div className="profile-backdrop" onClick={onClose}>
      <aside className="profile-panel" role="dialog" aria-label={`${tenant.name} profile`} onClick={(e) => e.stopPropagation()}>
        <div className="profile-head">
          <div className="chat-avatar renter profile-avatar">{initials(tenant.name)}</div>
          <div className="profile-head-text">
            <h2>{tenant.name}</h2>
            <div className="muted small">{tenant.occupation}</div>
          </div>
          <button className="profile-close" onClick={onClose} aria-label="Close profile">×</button>
        </div>

        <section className="profile-section">
          <dl className="profile-facts">
            <dt>Room</dt><dd>{p.room.name}</dd>
            <dt>Rent</dt><dd>{dollars(p.rent)}/mo</dd>
            <dt>Lease type</dt><dd>{monthToMonth ? 'Month-to-month' : '6 months or longer'}</dd>
            <dt>Lease start</dt><dd>{shortDate(tenant.leaseStart)}</dd>
            <dt>Lease end</dt><dd>{monthToMonth ? 'Rolling' : shortDate(leaseEndDate(tenant.leaseStart))}</dd>
          </dl>
        </section>

        <section className="profile-section">
          <h3>Contact</h3>
          <div className="profile-contact">
            <span>✉️ {contact.email}</span>
            <span>📞 {contact.phone}</span>
          </div>
        </section>

        <section className="profile-section">
          <h3>Payment history</h3>
          <PaymentRow payments={p.payments} leaseStart={tenant.leaseStart} />
        </section>

        <section className="profile-section">
          <h3>Road Map progress</h3>
          <div className="profile-roadmap">
            <div>
              <div className="summary-label">Current stage</div>
              <div className="profile-stage">{ROAD_MAP_STAGES[p.stage]} <span className="muted small">· stage {p.stage + 1} of {ROAD_MAP_STAGES.length}</span></div>
            </div>
            <div>
              <div className="summary-label">Down payment saved</div>
              <div className="profile-stage">{Math.floor(p.pct)}% <span className="muted small">· {dollars(p.saved)} of {dollars(p.goal)}</span></div>
              <div className="meter"><div className="meter-fill" style={{ width: `${p.pct}%` }} /></div>
            </div>
            <div>
              <div className="summary-label">Estimated ready</div>
              <div className="profile-stage">{p.monthsLeft === 0 ? 'Ready now' : monthLabel(p.readyMonth)}</div>
            </div>
          </div>
          <p className="profile-note">🔒 Shared with Onramp coach</p>
        </section>

        <section className="profile-section">
          <h3>Documents</h3>
          {doc ? (
            <div className="doc-preview">
              <button className="back-link doc-back" onClick={() => setOpenDoc(null)}>← All documents</button>
              <div className="doc-page">
                <div className="doc-page-title">{doc.name}</div>
                <div className="doc-page-sub">{tenant.name} · {p.room.name}</div>
                <div className="doc-lines"><span /><span /><span /><span className="short" /></div>
                <div className={doc.ok ? 'doc-stamp' : 'doc-stamp pending'}>{doc.status}</div>
              </div>
              <p className="muted small">{doc.detail}. Placeholder preview: the prototype doesn't store real files.</p>
            </div>
          ) : (
            <ul className="doc-list">
              {documents.map((d) => (
                <li key={d.name}>
                  <button className="doc-item" onClick={() => setOpenDoc(d.name)}>
                    <span>📄 {d.name}</span>
                    <span className={d.ok ? 'badge green' : 'badge orange'}>{d.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="profile-section">
          <h3>Maintenance</h3>
          {tickets.length === 0 ? (
            <p className="muted small">No maintenance requests.</p>
          ) : (
            <ul className="profile-tickets">
              {tickets.map((m) => (
                <li key={m.id}>
                  <span>{m.issue}</span>
                  <span className="muted small">{shortDate(m.createdAt)}</span>
                  <span className={m.status === 'done' ? 'badge green' : m.status === 'open' ? 'badge orange' : 'badge gray'}>{TICKET_LABELS[m.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="profile-section">
          <h3>Messages</h3>
          {thread ? (
            <button className="button secondary" onClick={() => onOpenThread(thread.id)}>
              💬 Open conversation ({thread.messages.length} {thread.messages.length === 1 ? 'message' : 'messages'})
            </button>
          ) : (
            <p className="muted small">No conversation yet.</p>
          )}
        </section>
      </aside>
    </div>
  )
}
