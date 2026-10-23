// A tenant's progress toward buying a home, worked out from their rent payments.
// Used on the manager side (tenant profiles, homebuyer pipeline). It follows the same
// rules as the tenant's My Home dashboard, so both sides show the same numbers.
import { CURRENT_MONTH, CREDIT_BUILD_MONTHS, rentFor, monthlySavings, addMonths } from '../constants.js'

// The Homebuyer Road Map stages, in order.
export const ROAD_MAP_STAGES = ['Rent', 'Build credit', 'Save', 'Meet a lender', 'Buy with Onramp Homes']

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

// Everything the manager needs about one tenant's savings: how much they've saved vs. a studio,
// % of their down payment, the month they'll be ready at this pace, and their Road Map stage.
export function tenantProgress(data, tenant) {
  const room = data.rooms.find((r) => r.id === tenant.roomId)
  const rent = rentFor(room, tenant.leaseType)
  const perMonth = monthlySavings(rent)
  const payments = data.payments
    .filter((p) => p.tenantId === tenant.id)
    .sort((a, b) => a.month.localeCompare(b.month))
  const saved = perMonth * payments.filter((p) => p.status === 'paid').length
  const goal = tenant.savingsGoal
  const pct = Math.min(100, (saved / goal) * 100)
  const monthsLeft = Math.max(0, Math.ceil((goal - saved) / perMonth))
  const streak = onTimeStreak(payments)
  // Build credit while the streak is short, then Save until the goal, then Meet a lender.
  const stage = streak < CREDIT_BUILD_MONTHS ? 1 : saved < goal ? 2 : 3

  return { room, rent, payments, saved, goal, pct, monthsLeft, readyMonth: addMonths(CURRENT_MONTH, monthsLeft), streak, stage }
}
