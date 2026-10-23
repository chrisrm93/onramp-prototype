// Tenant sidebar: the "viewing as" switcher, then the journey stages (Find a room → Move in → My Home)
// with done, current, and locked states, and Messages pinned at the bottom.
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useData, useSession } from '../data/store.js'
import { STAGES, stageForPath, getViewer, viewerOptions } from '../data/viewer.js'

// Short description of who's being viewed, under their name.
function roleLabel(viewer, data) {
  if (viewer.lease) return `Tenant · ${data.rooms.find((r) => r.id === viewer.tenant.roomId)?.name}`
  if (viewer.applicant || viewer.tenant) return 'Applicant'
  return 'Prospective renter'
}

export default function TenantSidebar() {
  const [data] = useData()
  const [session, updateSession] = useSession()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const viewer = getViewer(data, session)
  const onPage = stageForPath(pathname)
  // A dot on Messages when property management spoke last.
  const lastMessage = viewer.inquiry?.messages[viewer.inquiry.messages.length - 1]
  const unread = lastMessage?.from === 'manager'

  // Switch people and jump to the stage they're on, so the demo lands in the right place.
  function switchViewer(viewAs) {
    updateSession({ viewAs: viewAs || null })
    navigate(STAGES[getViewer(data, { ...session, viewAs: viewAs || null }).stage].path)
  }

  return (
    <aside className="sidebar">
      <label className="viewing-as">
        Demo: viewing as
        <select value={session.viewAs ?? ''} onChange={(e) => switchViewer(e.target.value)}>
          {viewerOptions(data, session).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      <div className="sidebar-person">
        <div className="chat-avatar renter">{initials(viewer.name)}</div>
        <div>
          <div className="sidebar-person-name">{viewer.name ?? 'Welcome!'}</div>
          <div className="muted small">{roleLabel(viewer, data)}</div>
        </div>
      </div>

      <ol className="stages">
        {STAGES.map((s, i) => {
          const state = i < viewer.stage ? 'done' : i === viewer.stage ? 'current' : 'locked'
          const content = (
            <>
              <span className="stage-icon">{state === 'done' ? '✓' : state === 'locked' ? '🔒' : i + 1}</span>
              <span className="stage-text">
                <span className="stage-name">{s.name}</span>
                <span className="stage-line">{s.line}</span>
              </span>
            </>
          )
          return (
            <li key={s.name}>
              {state === 'locked' ? (
                <span className="stage stage-locked" aria-disabled="true">{content}</span>
              ) : (
                <Link to={s.path} className={`stage stage-${state}${onPage === i ? ' on-page' : ''}`}>{content}</Link>
              )}
            </li>
          )
        })}
      </ol>

      <Link to="/messages" className={onPage === null ? 'sidebar-messages on-page' : 'sidebar-messages'}>
        <span>💬 Messages</span>
        {unread && <span className="unread-dot" aria-label="New reply" />}
      </Link>
    </aside>
  )
}

// "Sam Okafor" -> "SO". Falls back to a wave before the renter has given a name.
function initials(name) {
  return name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '👋'
}
