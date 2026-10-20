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

// Extra charge for a month-to-month lease instead of 6 months or longer.
export const MONTH_TO_MONTH_PREMIUM = 50

// The "current" month in the demo, so seed data and the dashboard agree.
export const CURRENT_MONTH = '2026-10'

// localStorage key that both tabs (Tenant and Manager) share.
export const STORAGE_KEY = 'onramp-data'

// Separate key for "who is using the tenant tab" (which renter conversation is theirs).
export const SESSION_KEY = 'onramp-session'

// Bump this whenever the seed data's shape changes, so old saved data gets replaced.
export const SEED_VERSION = 2

// Monthly savings vs. a studio for a room at the given rent.
export function monthlySavings(rent) {
  return STUDIO_TOTAL - rent
}

// How many months of savings at this rent until the down payment is covered.
export function monthsToGoal(rent, goal = SAVINGS_GOAL) {
  return Math.ceil(goal / monthlySavings(rent))
}

// Format a number as whole dollars, e.g. 4214 -> "$4,214".
export function dollars(n) {
  return '$' + Math.round(n).toLocaleString('en-US')
}
