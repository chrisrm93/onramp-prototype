// Tenant view shell: the journey sidebar on the left, the current page on the right.
// If someone opens a stage they haven't reached yet, it shows a locked notice instead.
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useData, useSession } from '../data/store.js'
import { STAGES, stageForPath, getViewer } from '../data/viewer.js'
import TenantSidebar from './TenantSidebar.jsx'

export default function TenantLayout() {
  const [data] = useData()
  const [session] = useSession()
  const { pathname } = useLocation()
  const viewer = getViewer(data, session)
  const onPage = stageForPath(pathname)
  const locked = onPage !== null && onPage > viewer.stage

  return (
    <div className="tenant-layout">
      <TenantSidebar />
      <div className="tenant-content">
        {locked ? <LockedStage stage={STAGES[onPage]} current={STAGES[viewer.stage]} /> : <Outlet />}
      </div>
    </div>
  )
}

// What a locked stage shows: what it is, and a way back to the stage they're on.
function LockedStage({ stage, current }) {
  return (
    <div className="page narrow">
      <div className="card confirm">
        <div className="confirm-icon">🔒</div>
        <h1>{stage.name} is locked</h1>
        <p className="muted">You'll get here after the steps before it. Right now you're on {current.name}.</p>
        <Link to={current.path} className="button">Go to {current.name}</Link>
      </div>
    </div>
  )
}
