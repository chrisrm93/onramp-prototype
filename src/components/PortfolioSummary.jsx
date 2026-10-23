// Portfolio snapshot at the top of the manager view: how full the live houses are,
// what they bring in each month, and what's coming next. Shows the business can scale.
import { rentFor, dollars } from '../constants.js'

export default function PortfolioSummary({ data }) {
  const liveIds = data.properties.filter((p) => p.status === 'live').map((p) => p.id)
  const rooms = data.rooms.filter((r) => liveIds.includes(r.propertyId))
  const occupied = rooms.filter((r) => r.status === 'occupied').length
  const occupancy = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0
  const tenants = data.tenants.filter((t) => liveIds.includes(t.propertyId))
  const monthlyRent = tenants.reduce((sum, t) => sum + rentFor(data.rooms.find((r) => r.id === t.roomId), t.leaseType), 0)
  const upcoming = data.properties.filter((p) => p.status === 'coming_soon')
  const plannedRooms = upcoming.reduce((sum, p) => sum + (p.plannedRooms ?? 0), 0)

  return (
    <section className="stats stats-3">
      <div className="stat card">
        <div className="stat-label">Occupancy</div>
        <div className={occupancy === 100 ? 'stat-value green' : 'stat-value'}>{occupancy}%</div>
        <div className="meter"><div className="meter-fill" style={{ width: `${occupancy}%` }} /></div>
        <div className="stat-note">{occupied} of {rooms.length} rooms filled</div>
      </div>
      <div className="stat card">
        <div className="stat-label">Monthly rent</div>
        <div className="stat-value">{dollars(monthlyRent)}</div>
        <div className="stat-note">across {liveIds.length} live {liveIds.length === 1 ? 'property' : 'properties'}</div>
      </div>
      <div className="stat card">
        <div className="stat-label">Pipeline</div>
        <div className="stat-value">+{plannedRooms}</div>
        <div className="stat-note">rooms in {upcoming.length} coming-soon {upcoming.length === 1 ? 'home' : 'homes'}</div>
      </div>
    </section>
  )
}
