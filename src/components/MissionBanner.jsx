// Mission banner at the top of the listing: tells prospects why Onramp exists
// before they look at a single room. Rent → Prepare → Own is the whole pitch.

const STEPS = [
  { name: 'Rent', line: 'A furnished room with utilities and parking included.' },
  { name: 'Prepare', line: 'Save the difference and build credit with on-time rent.' },
  { name: 'Own', line: 'Buy your first home with Onramp Homes.' },
]

export default function MissionBanner() {
  return (
    <section className="mission">
      <h1 className="mission-headline">Rent a beautiful home. Save for your own.</h1>
      <p className="mission-sub">
        Onramp rooms cost about $600/mo less than a Salem studio, all in. That difference goes
        toward your down payment, your on-time rent builds your credit, and our Homebuyer Road Map
        gets you to your own front door.
      </p>
      <ol className="mission-steps">
        {STEPS.map((step, i) => (
          <li key={step.name} className="mission-step">
            <span className="mission-step-num">{i + 1}</span>
            <div>
              <div className="mission-step-name">{step.name}</div>
              <div className="mission-step-line">{step.line}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
