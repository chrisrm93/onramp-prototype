// Who the tenant tab is showing, and how far along the Onramp journey they are.
// The demo can view as the live renter (whoever is clicking through the flow right now),
// the demo applicant, or the demo tenant. Every tenant-side page reads from here.

// The three journey stages in the tenant sidebar, in order.
export const STAGES = [
  { name: 'Find a room', line: 'Browse the home and compare rooms', path: '/' },
  { name: 'Move in', line: 'Tour, apply, and sign your lease', path: '/move-in' },
  { name: 'My Home', line: 'Save and build credit', path: '/home' },
]

// Which stage a tenant-side URL belongs to. Messages sits outside the stages, so it's null.
// Booking a tour and applying start from the listing, so they count as Find a room.
export function stageForPath(pathname) {
  if (pathname.startsWith('/home')) return 2
  if (pathname.startsWith('/move-in')) return 1
  if (pathname.startsWith('/messages')) return null
  return 0
}

// Gather everything about the person being viewed: their chat, tour, application,
// tenancy, and lease, plus which stage (0, 1, or 2) they've reached.
// `session.viewAs` is an applicant or tenant id; empty means the live renter.
export function getViewer(data, session) {
  const viewTenant = data.tenants.find((t) => t.id === session.viewAs)
  const viewApplicant = data.applicants.find((a) => a.id === session.viewAs)
  const kind = viewTenant ? 'tenant' : viewApplicant ? 'applicant' : 'renter'

  let applicant = viewApplicant ?? null
  if (kind === 'tenant') applicant = data.applicants.find((a) => a.tenantId === viewTenant.id) ?? null
  if (kind === 'renter') applicant = data.applicants.find((a) => a.id === session.applicantId) ?? null

  const tenant = viewTenant ?? data.tenants.find((t) => t.id === applicant?.tenantId) ?? null
  // Their chat: the one they applied from, the live renter's own, or (for a tenant) one tied to their tenancy.
  const inquiryId = applicant?.inquiryId ?? (kind === 'renter' ? session.inquiryId : null)
  const inquiry = data.inquiries.find((i) => i.id === inquiryId)
    ?? (tenant && data.inquiries.find((i) => i.tenantId === tenant.id))
    ?? null
  const tour = inquiry ? data.tours.find((t) => t.inquiryId === inquiry.id) ?? null : null
  const lease = tenant ? data.leases.find((l) => l.tenantId === tenant.id) ?? null : null

  // Signed lease: they live here. Talking to us or applied: they're moving in. Otherwise: still looking.
  const stage = lease ? 2 : inquiry || applicant || tenant ? 1 : 0
  const name = tenant?.name ?? applicant?.name ?? inquiry?.name ?? null

  return { kind, name, inquiry, tour, applicant, tenant, lease, stage }
}

// The people in the "Demo: viewing as" switcher: the live renter, the demo applicant, the demo tenant.
export function viewerOptions(data, session) {
  const live = getViewer(data, { ...session, viewAs: null })
  const applicant = data.applicants.find((a) => a.isDemoApplicant)
  const tenant = data.tenants.find((t) => t.isDemoTenant)
  return [
    { value: '', label: live.name ? `${live.name} (${live.applicant ? 'applicant' : 'new renter'})` : 'New renter' },
    applicant && { value: applicant.id, label: `${applicant.name} (applicant)` },
    tenant && { value: tenant.id, label: `${tenant.name} (tenant)` },
  ].filter(Boolean)
}
