// The Homebuyer Road Map drawn as an actual road: a winding SVG road with a dashed center line,
// five milestone signposts along it, and a "You are here" marker placed by the tenant's progress.
// Signposts sit in HTML on top of the SVG (positioned in %) so their text stays crisp and wraps.

// Drawing size of the SVG. The overlay uses the same box, so % positions line up.
const W = 1000
const H = 360

// Where each milestone sits on the road. The road swings down, up, down, up, down.
const POINTS = [
  [80, 230],
  [290, 130],
  [500, 230],
  [710, 130],
  [920, 230],
]

// Control points for the curve from point a to point b: flat tangents give a smooth S-bend.
function controls([ax, ay], [bx, by]) {
  const dx = (bx - ax) / 2
  return [[ax + dx, ay], [bx - dx, by]]
}

// The road as an SVG path: a short straight lead-in, an S-bend between each milestone, a lead-out.
function roadPath() {
  let d = `M 0 ${POINTS[0][1]} L ${POINTS[0][0]} ${POINTS[0][1]}`
  for (let i = 1; i < POINTS.length; i++) {
    const [c1, c2] = controls(POINTS[i - 1], POINTS[i])
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${POINTS[i][0]} ${POINTS[i][1]}`
  }
  const last = POINTS[POINTS.length - 1]
  return d + ` L ${W} ${last[1]}`
}

// A point part-way (t from 0 to 1) along the curve between milestone i and i + 1.
// Same cubic Bézier the path draws, so the marker sits exactly on the road.
function pointOnRoad(i, t) {
  const a = POINTS[i]
  const b = POINTS[i + 1]
  const [c1, c2] = controls(a, b)
  const u = 1 - t
  const at = (k) => u * u * u * a[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * b[k]
  return [at(0), at(1)]
}

// Turn an SVG coordinate into a CSS position on the overlay.
function place([x, y]) {
  return { left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }
}

// milestones: [{ name, line }]. current: index of the milestone the tenant is working on now;
// the ones before it are checked. fraction: how far (0 to 1) they've come toward it.
// markerLabel: text on the "You are here" pin.
export default function RoadMap({ milestones, current, fraction, markerLabel }) {
  const d = roadPath()
  // The marker sits on the stretch leading into the current milestone,
  // kept off the signpost dots at either end of it.
  const marker = current <= 0 ? POINTS[0] : pointOnRoad(current - 1, Math.min(0.94, Math.max(0.06, fraction)))

  return (
    <div className="road-scroll">
      <div className="road">
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <path d={d} className="road-shoulder" />
          <path d={d} className="road-surface" />
          <path d={d} className="road-center" />
        </svg>

        {milestones.map((m, i) => {
          const state = i < current ? 'passed' : i === current ? 'current' : 'ahead'
          const up = POINTS[i][1] < 200 // high stops get their sign above the road, low ones below
          // The end signs hang inward so they don't spill past the card edges.
          const edge = i === 0 ? 'first' : i === milestones.length - 1 ? 'last' : ''
          return (
            <div key={m.name} className={`road-stop ${up ? 'up' : 'down'} ${state} ${edge}`} style={place(POINTS[i])}>
              <span className="road-dot">{state === 'passed' ? '✓' : i + 1}</span>
              <div className="road-sign">
                <div className="road-sign-name">{m.name}</div>
                <div className="road-sign-line">{m.line}</div>
              </div>
            </div>
          )
        })}

        <div className="road-marker" style={place(marker)}>
          <span className="road-marker-pin">📍 {markerLabel}</span>
          <span className="road-marker-dot" />
        </div>
      </div>
    </div>
  )
}
