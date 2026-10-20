// Room picker: lets a prospect compare rooms side by side and see how much each saves vs. a studio.
// Clicking an available room starts a conversation with property management about it.
import { STUDIO_TOTAL, monthlySavings, monthsToGoal, dollars } from '../constants.js'

// Turn the bathroom type into the tier name and description shown on each card.
function describeRoom(room) {
  return room.bathType === 'ensuite'
    ? { tier: 'Master suite', bath: 'Private en-suite bathroom' }
    : { tier: 'Standard room', bath: 'Shared bathroom, double vanity' }
}

export default function RoomPicker({ rooms, onSelect }) {
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
            <button
              key={room.id}
              className={available ? 'room' : 'room unavailable'}
              onClick={() => available && onSelect(room.id)}
              disabled={!available}
            >
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
              {available && <div className="room-cta">Message us about this room →</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
