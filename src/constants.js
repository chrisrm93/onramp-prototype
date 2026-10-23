// All the numbers behind the savings pitch live here so they're easy to tweak.

// What a Salem studio costs per month, all in. Onramp includes utilities and parking.
export const STUDIO_RENT = 1357
export const STUDIO_UTILITIES = 150
export const STUDIO_PARKING = 45
export const STUDIO_TOTAL = STUDIO_RENT + STUDIO_UTILITIES + STUDIO_PARKING // $1,552

// One-time savings because the home comes furnished.
export const FURNITURE_SAVINGS_LOW = 1500
export const FURNITURE_SAVINGS_HIGH = 3000

// The home a tenant is saving toward, and the FHA minimum down payment on it.
export const HOME_PRICE = 440000
export const DOWN_PAYMENT_PCT = 0.035
export const SAVINGS_GOAL = Math.round(HOME_PRICE * DOWN_PAYMENT_PCT) // $15,400

// Rent credit a tenant earns for each on-time month, put toward closing costs when they buy with Onramp Homes.
// PLACEHOLDER: confirm with [teammate]
export const RENT_CREDIT_PER_MONTH = 50

// Onramp Homes brokerage commission on each tenant's future purchase, for the manager's homebuyer pipeline.
// PLACEHOLDER: confirm with [teammate]
export const COMMISSION_RATE = 0.025
export const AVG_HOME_PRICE = 440000

// Extra charge for a month-to-month lease instead of 6 months or longer.
export const MONTH_TO_MONTH_PREMIUM = 50

// How long a "6 months or longer" lease runs, for the end date on the manager's Leases tab.
export const LEASE_TERM_MONTHS = 12

// On-time months of rent before the Road Map counts "Build credit" as done.
export const CREDIT_BUILD_MONTHS = 6

// Months of reported rent history many mortgage lenders look for (Mortgage readiness card).
export const LENDER_HISTORY_MONTHS = 12

// Monthly repair budget per property, drawn as the dashed line on the maintenance spend chart.
export const REPAIR_BUDGET_MONTHLY = 350

// Kinds of maintenance work, for tracking where repair money goes.
export const MAINTENANCE_CATEGORIES = ['Plumbing', 'Appliance', 'HVAC', 'Electrical', 'General']

// The "current" month in the demo, so seed data and the dashboard agree.
export const CURRENT_MONTH = '2026-10'

// localStorage key that both tabs (Tenant and Manager) share.
export const STORAGE_KEY = 'onramp-data'

// Separate key for "who is using the tenant tab" (which renter conversation is theirs).
export const SESSION_KEY = 'onramp-session'

// Bump this whenever the seed data's shape changes, so old saved data gets replaced.
export const SEED_VERSION = 7

// Monthly savings vs. a studio for a room at the given rent.
export function monthlySavings(rent) {
  return STUDIO_TOTAL - rent
}

// How many months of savings at this rent until the down payment is covered.
export function monthsToGoal(rent, goal = SAVINGS_GOAL) {
  return Math.ceil(goal / monthlySavings(rent))
}

// What a tenant actually pays each month: room rent, plus the premium for month-to-month.
export function rentFor(room, leaseType) {
  return room.rent + (leaseType === 'month-to-month' ? MONTH_TO_MONTH_PREMIUM : 0)
}

// Format a number as whole dollars, e.g. 4214 -> "$4,214".
export function dollars(n) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

// Format a date like "Oct 12, 2026". Date-only strings ("2026-04-01") are read as
// local time, otherwise the browser treats them as UTC and Oregon sees the day before.
export function shortDate(iso) {
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Move a "YYYY-MM" month forward by n months, e.g. ("2026-10", 3) -> "2027-01".
// Used to estimate the month a tenant reaches their down payment.
export function addMonths(month, n) {
  const [y, m] = month.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

// Every month from `start` through `end` ("YYYY-MM"), e.g. for one bar per month on a chart.
export function monthSpan(start, end) {
  const months = []
  for (let m = start; m <= end; m = addMonths(m, 1)) months.push(m)
  return months
}

// Whole days a maintenance ticket took from report to fix, or null if it's still open.
export function daysToResolve(ticket) {
  if (!ticket.resolvedAt) return null
  return Math.max(1, Math.round((new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / 86400000))
}

// Name a "YYYY-MM" month: "October 2026", or just "Oct" with style "short".
export function monthLabel(month, style = 'long') {
  const options = style === 'short' ? { month: 'short' } : { month: 'long', year: 'numeric' }
  return new Date(month + '-01T00:00:00').toLocaleDateString('en-US', options)
}

// Last day of a fixed-term lease that starts on `start` ("YYYY-MM-DD"), as "YYYY-MM-DD".
export function leaseEndDate(start) {
  const d = new Date(start + 'T00:00:00')
  d.setMonth(d.getMonth() + LEASE_TERM_MONTHS)
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('en-CA')
}
