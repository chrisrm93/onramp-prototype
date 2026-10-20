// Tenant-facing listing: everything a prospect needs to fall for the house and pick a room.
// Shows whichever property is in the URL, or the first live property by default.
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../data/store.js'
import MissionBanner from '../components/MissionBanner.jsx'
import PhotoGallery from '../components/PhotoGallery.jsx'
import RoomPicker from '../components/RoomPicker.jsx'

export default function ListingPage() {
  const [data] = useData()
  const { propertyId } = useParams()
  const property = propertyId
    ? data.properties.find((p) => p.id === propertyId)
    : data.properties.find((p) => p.status === 'live')
  const navigate = useNavigate()

  if (!property) {
    return <div className="page"><h1>Property not found</h1></div>
  }

  const rooms = data.rooms.filter((r) => r.propertyId === property.id)

  return (
    <div className="page listing">
      <MissionBanner />

      <section className="listing-title">
        <h1>{property.name}</h1>
        <p className="muted">{property.address} · {property.neighborhood}</p>
      </section>

      <PhotoGallery photos={property.photos} alt={property.name} />

      <div className="listing-grid">
        <div className="listing-main">
          <section className="card">
            <h2>Video tour</h2>
            <div className="video">
              <iframe
                src={`https://www.youtube.com/embed/${property.youtubeId}`}
                title={`${property.name} video tour`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>

          <section className="card">
            <h2>Choose your room</h2>
            <RoomPicker rooms={rooms} onSelect={(roomId) => navigate(`/property/${property.id}/contact/${roomId}`)} />
          </section>
        </div>

        <aside className="listing-side">
          <InfoList title="Highlights" items={property.highlights} />
          <section className="card">
            <h2>Location</h2>
            <div className="tags">
              {property.locationTags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
          </section>
          <InfoList title="House rules" items={property.houseRules} />
          <InfoList title="Lease terms" items={property.leaseTerms} />
        </aside>
      </div>
    </div>
  )
}

// A titled card with a checkmark list, used for highlights, rules, and lease terms.
function InfoList({ title, items }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <ul className="check-list">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  )
}
