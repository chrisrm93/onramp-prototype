// Payment history as one compact row: a circle for each of the 12 months in the current lease year.
// Green = paid on time, red = late, outlined = not paid yet. One line underneath sums up credit reporting.
import { CURRENT_MONTH, addMonths, monthLabel } from '../constants.js'

const STATUS_TEXT = { paid: 'Paid on time', late: 'Late', upcoming: 'Upcoming' }

// "2026-04" -> a running month count, so we can subtract two months.
function monthNumber(month) {
  const [y, m] = month.split('-').map(Number)
  return y * 12 + m
}

export default function PaymentRow({ payments, leaseStart }) {
  // The lease year we're in now, e.g. Apr 2026 to Mar 2027 for a lease that started in April.
  const start = leaseStart.slice(0, 7)
  const yearsIn = Math.floor(Math.max(0, monthNumber(CURRENT_MONTH) - monthNumber(start)) / 12)
  const yearStart = addMonths(start, yearsIn * 12)
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i))

  const reported = payments.filter((p) => p.reportedToCredit).length
  const anyLate = payments.some((p) => p.status === 'late')

  return (
    <div className="pay-row-wrap">
      <ol className="pay-row">
        {months.map((month) => {
          const status = payments.find((p) => p.month === month)?.status
          const state = status === 'paid' || status === 'late' ? status : 'upcoming'
          return (
            <li key={month} className={`pay-month ${state}`} title={`${monthLabel(month)}: ${STATUS_TEXT[state]}`}>
              <span className="pay-dot" />
              <span className="pay-initial">{monthLabel(month, 'short')[0]}</span>
            </li>
          )
        })}
      </ol>
      <p className="pay-summary">
        {reported === 0
          ? 'Your first on-time payment will be reported to the credit bureaus.'
          : `${anyLate ? '' : 'All '}${reported} on-time ${reported === 1 ? 'payment' : 'payments'} reported to the credit bureaus.`}
      </p>
    </div>
  )
}
