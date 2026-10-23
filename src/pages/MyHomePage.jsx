// My Home: the tenant's dashboard and the heart of the pitch. It shows how much they've
// saved by living here instead of a studio, how close they are to a down payment,
// and the on-time rent streak that's building their credit.
import { useState } from 'react'
import { useData, useSession } from '../data/store.js'
import { getViewer } from '../data/viewer.js'
import {
  CURRENT_MONTH, CREDIT_BUILD_MONTHS, FURNITURE_SAVINGS_LOW, FURNITURE_SAVINGS_HIGH, HOME_PRICE, RENT_CREDIT_PER_MONTH, DOWN_PAYMENT_PCT,
  rentFor, monthlySavings, addMonths, monthLabel, dollars, shortDate,
} from '../constants.js'
import RoadMap from '../components/RoadMap.jsx'
import PaymentRow from '../components/PaymentRow.jsx'
import MortgageReadiness from '../components/MortgageReadiness.jsx'

const TICKET_LABELS = { open: 'Open', in_progress: 'In progress', done: 'Done' }

export default function MyHomePage() {
  const [data, update] = useData()
  const [session] = useSession()
  const [issue, setIssue] = useState('')
  const { tenant } = getViewer(data, session)

  if (!tenant) {
    return <div className="page"><h1>No tenant to show</h1></div>
  }

  const property = data.properties.find((p) => p.id === tenant.propertyId)
  const room = data.rooms.find((r) => r.id === tenant.roomId)
  const rent = rentFor(room, tenant.leaseType)
  const perMonth = monthlySavings(rent)
  const payments = data.payments
    .filter((p) => p.tenantId === tenant.id)
    .sort((a, b) => a.month.localeCompare(b.month))
  const paidMonths = payments.filter((p) => p.status === 'paid').length
  const saved = perMonth * paidMonths
  const goal = tenant.savingsGoal
  const progress = Math.min(100, (saved / goal) * 100)
  const monthsLeft = Math.max(0, Math.ceil((goal - saved) / perMonth))
  const streak = onTimeStreak(payments)
  const unpaid = payments.find((p) => p.status !== 'paid' && p.month <= CURRENT_MONTH)
  const reportedMonths = payments.filter((p) => p.reportedToCredit).length
  // The streak card and the Road Map's "Build credit" signpost both use this one number.
  const current = roadMapStep(streak, saved, goal)
  // The Homebuyer Road Map, from moving in to buying a home, with live numbers on the signs.
  const milestones = [
    { name: 'Rent', line: 'Furnished, bills included' },
    { name: 'Build credit', line: streak >= CREDIT_BUILD_MONTHS ? `${streak} on-time months` : `${streak} of ${CREDIT_BUILD_MONTHS} on-time months` },
    { name: 'Save', line: `${Math.floor(progress)}% of ${dollars(goal)}` },
    { name: 'Meet a lender', line: 'Get pre-approved' },
    { name: 'Buy with Onramp Homes', line: 'Your own front door' },
  ]
  // How far toward the current signpost: credit months, then savings.
  const fraction = current === 1 ? streak / CREDIT_BUILD_MONTHS : current === 2 ? saved / goal : 1
  const markerLabel = current === 2 ? `You are here · ${Math.floor(progress)}%` : 'You are here'
  const tickets = data.maintenance
    .filter((m) => m.tenantId === tenant.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  // Mark the oldest unpaid month as paid and reported to credit. Shows up in the manager's rent roll.
  function payRent() {
    update((d) => {
      const p = d.payments.find((x) => x.id === unpaid.id)
      p.status = 'paid'
      p.reportedToCredit = true
    })
  }

  // Send a maintenance request to the manager's Maintenance tab.
  function submitTicket(e) {
    e.preventDefault()
    update((d) => {
      d.maintenance.push({
        id: `m-${Date.now()}`,
        propertyId: tenant.propertyId,
        roomId: tenant.roomId,
        tenantId: tenant.id,
        issue: issue.trim(),
        status: 'open',
        createdAt: new Date().toISOString(),
      })
    })
    setIssue('')
  }

  return (
    <div className="page home">
      <div className="home-top">
        <h1>Welcome home, {tenant.name.split(' ')[0]}</h1>
        <p className="muted">{room.name} · {property.name} · since {shortDate(tenant.leaseStart)}</p>
      </div>

      {/* The big number: what living here has saved so far, and how close the down payment is. */}
      <section className="savings-hero">
        <div className="savings-hero-label">Saved vs. a Salem studio so far</div>
        <div className="savings-hero-value">{dollars(saved)}</div>
        <div className="savings-hero-math">
          {dollars(perMonth)}/mo × {paidMonths} on-time {paidMonths === 1 ? 'month' : 'months'}
          <span className="savings-hero-extra">+ {dollars(FURNITURE_SAVINGS_LOW)}–{dollars(FURNITURE_SAVINGS_HIGH)} one-time savings on furniture</span>
          <span className="savings-hero-credit">
            Rent credit earned: <strong>{dollars(paidMonths * RENT_CREDIT_PER_MONTH)}</strong> toward closing costs when you buy with Onramp Homes
            <span className="illustrative">Illustrative</span>
          </span>
        </div>

        <div className="goal">
          <div className="goal-top">
            <span>Down payment goal</span>
            <span><strong>{Math.floor(progress)}%</strong> of {dollars(goal)}</span>
          </div>
          <div className="goal-bar"><div className="goal-fill" style={{ width: `${progress}%` }} /></div>
          <div className="goal-note">
            {monthsLeft === 0
              ? '🎉 Goal reached! Time to meet a lender.'
              : <>At this pace you'll be down-payment ready by <strong>{monthLabel(addMonths(CURRENT_MONTH, monthsLeft))}</strong>, {monthsLeft} months from now.</>}
          </div>
          <div className="goal-fine">
            {dollars(goal)} is a {(DOWN_PAYMENT_PCT * 100).toFixed(1)}% FHA down payment on a {dollars(HOME_PRICE)} Salem home.
          </div>
        </div>
      </section>

      <div className="home-grid">
        <section className="card home-card">
          <h2>Rent</h2>
          <div className="home-card-value">{dollars(rent)}<span>/mo</span></div>
          {unpaid ? (
            <>
              <p className={unpaid.status === 'late' ? 'rent-status late' : 'rent-status'}>
                {monthLabel(unpaid.month)} rent is {unpaid.status === 'late' ? 'late' : 'due'}.
              </p>
              <button className="button" onClick={payRent}>Pay {monthLabel(unpaid.month, 'short')} rent · {dollars(unpaid.amount)}</button>
            </>
          ) : (
            <p className="rent-status paid">✓ You're paid up for {monthLabel(CURRENT_MONTH)}.</p>
          )}
          <p className="muted small">Utilities and parking included.</p>
        </section>

        <section className="card home-card">
          <h2>Credit streak</h2>
          <div className="home-card-value">{streak}<span> {streak === 1 ? 'month' : 'months'} on time</span></div>
          <p className="muted small">Every on-time payment is reported to the credit bureaus, building the history a lender looks for.</p>
        </section>

        <MortgageReadiness reportedMonths={reportedMonths} saved={saved} goal={goal} />
      </div>

      <section className="card">
        <h2>Payment history</h2>
        <PaymentRow payments={payments} leaseStart={tenant.leaseStart} />
      </section>

      <section className="card">
        <h2>Your Homebuyer Road Map</h2>
        <RoadMap milestones={milestones} current={current} fraction={fraction} markerLabel={markerLabel} />
      </section>

      <section className="card">
        <h2>Maintenance</h2>
        <form className="ticket-form" onSubmit={submitTicket}>
          <input value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="What needs fixing? e.g. Kitchen faucet is dripping" />
          <button type="submit" className="button" disabled={!issue.trim()}>Submit request</button>
        </form>
        {tickets.length === 0 ? (
          <p className="muted small">No requests yet. Anything that needs fixing goes straight to property management.</p>
        ) : (
          <ul className="tickets">
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
    </div>
  )
}

// Months paid in a row, counting back from the latest month. A month that's only
// "due" (not yet late) doesn't break the streak.
function onTimeStreak(payments) {
  let count = 0
  for (const p of [...payments].reverse()) {
    if (p.status === 'due' && count === 0) continue
    if (p.status !== 'paid') break
    count++
  }
  return count
}

// The Road Map signpost the tenant is working on now: Build credit (1) while their on-time streak
// is still short, Save (2) until the down payment goal is reached, then Meet a lender (3).
function roadMapStep(streak, saved, goal) {
  if (streak < CREDIT_BUILD_MONTHS) return 1
  if (saved < goal) return 2
  return 3
}
