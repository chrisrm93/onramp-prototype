// Room picker: lets a prospect compare rooms side by side and see how much each saves vs. a studio.
// Available rooms let the prospect book a tour or apply right away, or send a message first.
import { Link } from 'react-router-dom'
import { STUDIO_TOTAL, monthlySavings, monthsToGoal, dollars } from '../constants.js'

// Turn the bathroom type into the tier name and description shown on each card.
function describeRoom(room) {
  return room.bathType === 'ensuite'
    ? { tier: 'Master suite', bath: 'Private en-suite bathroom' }
    : { tier: 'Standard room', bath: 'Shared bathroom, double vanity' }
}

export default function RoomPicker({ rooms }) {
  return (
    <div>
      <p className="muted small">
        Savings compare to a typical Salem studio at {dollars(STUDIO_TOTAL)}/mo with rent, utilities, and parking.
        Here, utilities and parking are included.
      </p>
      <div className="rooms">
        {rooms.map((room) => {
          const { tier, bath } = describeRoom(room)
          const available = room.status === 'available'
          return (
            <div key={room.id} className={available ? 'room' : 'room unavailable'}>
              <div className="room-top">
                <span className="room-tier">{tier}</span>
                <span className={available ? 'badge green' : 'badge gray'}>
                  {available ? 'Available' : 'Occupied'}
                </span>
              </div>
              <div className="room-name">{room.name}</div>
              <div className="room-bath">{bath}</div>
              <div className="room-rent">{dollars(room.rent)}<span>/mo</span></div>
              <div className="room-savings">Save {dollars(monthlySavings(room.rent))}/mo vs. a studio</div>
              <div className="room-goal">Down payment ready in ~{monthsToGoal(room.rent)} months</div>
              {available && (
                <>
                  <div className="room-actions">
                    <Link to={`/property/${room.propertyId}/tour/${room.id}`} className="button small-button">Book a tour</Link>
                    <Link to={`/property/${room.propertyId}/apply/${room.id}`} className="button secondary small-button">Apply</Link>
                  </div>
                  <Link to={`/property/${room.propertyId}/contact/${room.id}`} className="room-cta">Message us about this room →</Link>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
