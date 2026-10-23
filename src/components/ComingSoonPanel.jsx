// What the manager sees for a property that isn't open yet: the plan and what it will earn.
// There are no tenants to manage, so this replaces the tabs.
import { dollars } from '../constants.js'

export default function ComingSoonPanel({ property }) {
  const projected = (property.plannedRooms ?? 0) * (property.averageRent ?? 0)

  return (
    <section className="card coming-soon">
      <span className="badge orange">Opening {property.opening}</span>
      <h2>{property.name}</h2>
      <p className="muted">{property.address}</p>
      {property.description && <p>{property.description}</p>}
      <div className="apply-summary">
        <div>
          <div className="summary-label">Planned rooms</div>
          <div className="summary-value">{property.plannedRooms}</div>
        </div>
        <div>
          <div className="summary-label">Average rent</div>
          <div className="summary-value">{dollars(property.averageRent)}<span>/mo</span></div>
        </div>
        <div>
          <div className="summary-label">Projected rent at full occupancy</div>
          <div className="summary-value green">{dollars(projected)}<span>/mo</span></div>
        </div>
      </div>
      <p className="muted small">No tenants yet. Inquiries, leases, and rent will show up here once it opens.</p>
    </section>
  )
}
