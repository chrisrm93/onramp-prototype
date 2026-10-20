// Starting data for the demo. Loaded into localStorage on first run and on "Reset demo data".
// This is the only file allowed to mention specific properties by name.
import { CURRENT_MONTH, SAVINGS_GOAL, SEED_VERSION } from '../constants.js'

const MEADOWS = 'p-meadows'
const HOME2 = 'p-home2'

// List every month from `start` through `end` (inclusive), as "YYYY-MM" strings.
// Used to build each tenant's payment history without typing it out by hand.
function monthsBetween(start, end) {
  const out = []
  let [y, m] = start.split('-').map(Number)
  const [endY, endM] = end.split('-').map(Number)
  while (y < endY || (y === endY && m <= endM)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return out
}

// Build a tenant's payment history: every month paid on time, except the
// current month gets `currentStatus` (so we can show someone as late).
function paymentHistory(tenantId, leaseStart, rent, currentStatus) {
  return monthsBetween(leaseStart.slice(0, 7), CURRENT_MONTH).map((month) => {
    const status = month === CURRENT_MONTH ? currentStatus : 'paid'
    return {
      id: `pay-${tenantId}-${month}`,
      tenantId,
      month,
      amount: rent,
      status,
      reportedToCredit: status === 'paid',
    }
  })
}

const properties = [
  {
    id: MEADOWS,
    name: 'The Meadows House',
    address: '1325 Oppek St NE, Keizer, Oregon',
    neighborhood: 'North Keizer, Meadows neighborhood',
    status: 'live',
    youtubeId: 'bTRJqE3y5uM',
    photos: [
      '/photos/meadows/664225884_2024123431838208_5286621998613634112_n.jpg',
      '/photos/meadows/665898276_1434424887885307_7419066055434298063_n.jpg',
      '/photos/meadows/666003314_789677977233875_5949175986910021256_n.jpg',
      '/photos/meadows/666023772_1360832562472131_3139433934330279461_n.jpg',
      '/photos/meadows/666343009_959274226496631_1037710433825724524_n.jpg',
      '/photos/meadows/666481524_1587461309014414_6993785857636645425_n.jpg',
      '/photos/meadows/666488415_1442819443542302_504965196379149071_n.jpg',
      '/photos/meadows/666563320_893266820382466_6288937505244295679_n.jpg',
      '/photos/meadows/666793067_875685272189159_3187617091015369536_n.jpg',
      '/photos/meadows/666924008_1721608479221734_5673222017643038604_n.jpg',
      '/photos/meadows/666993686_943119565123367_3551877755756329660_n.jpg',
      '/photos/meadows/667501976_2119237201952118_3233122695826812675_n.jpg',
      '/photos/meadows/667597644_953017440708558_548575356795001377_n.jpg',
      '/photos/meadows/667676993_926603956848737_8567522549382983691_n.jpg',
      '/photos/meadows/667751980_4203731923290246_7500372905547827053_n.jpg',
      '/photos/meadows/667757634_26234381499565573_8563756834168562040_n.jpg',
      '/photos/meadows/667827553_1432236768183089_832667161200186082_n.jpg',
      '/photos/meadows/668494123_2034688413929571_5774946161082312548_n.jpg',
      '/photos/meadows/668725423_1688232038851467_2323522426214707021_n.jpg',
      '/photos/meadows/668790988_1313385407376881_4776882644361727470_n.jpg',
      '/photos/meadows/668837133_1650987759248960_4319740015986681963_n.jpg',
      '/photos/meadows/668847375_2242442476165439_7720317952032280561_n.jpg',
      '/photos/meadows/668853389_2087567028767169_1580130370384301584_n.jpg',
      '/photos/meadows/669047928_26476735205327972_1866327044938798449_n.jpg',
      '/photos/meadows/669329742_1497276778420213_687264965122998070_n.jpg',
      '/photos/meadows/669358840_1338602008138264_351246376117007558_n.jpg',
      '/photos/meadows/669393880_1474057797624958_6044379773315273553_n.jpg',
      '/photos/meadows/669800582_26438994725786118_7552686375299073471_n.jpg',
      '/photos/meadows/669800654_3928063894160754_6505823522709676451_n.jpg',
      '/photos/meadows/669811227_1541048237805421_3285478054347302328_n.jpg',
      '/photos/meadows/669909415_1506616920865475_1930145420269375780_n.jpg',
      '/photos/meadows/670005993_1522517202765688_9056191465910242165_n.jpg',
      '/photos/meadows/670144573_1343381387628071_8495639495297147687_n.jpg',
      '/photos/meadows/670176236_2167857490630649_1417670451619023928_n.jpg',
      '/photos/meadows/670214892_4391135427781540_6640695704213770970_n.jpg',
      '/photos/meadows/670393913_1377581201076775_4273676324874717021_n.jpg',
    ],
    highlights: [
      'Brand-new construction with modern finishes',
      'Open-concept kitchen, living and dining',
      'Furnished common areas',
      'Kitchen supplies included',
      'Large upstairs laundry room with washer/dryer',
      'Professional management',
      'Maid service for shared spaces once a month',
      'Utilities included',
      'Free parking',
    ],
    locationTags: [
      '15 min to Salem Health Hospital',
      '5 min to I-5',
      'Near Keizer Rapids Park',
      'Driving distance to Santiam, West Valley, Albany General, and Silverton hospitals',
    ],
    houseRules: [
      'All residents background checked',
      'No pets',
      'No couples',
    ],
    leaseTerms: [
      '6 months or longer',
      'Month-to-month available for +$50/mo',
    ],
  },
  {
    id: HOME2,
    name: 'Onramp Home #2',
    address: 'Salem, Oregon',
    neighborhood: 'Salem',
    status: 'coming_soon',
    opening: '2027',
    description: 'Purpose-built for room-by-room living. About 11 rooms, $950 average rent.',
    plannedRooms: 11,
    averageRent: 950,
    youtubeId: '',
    photos: [],
    highlights: [],
    locationTags: [],
    houseRules: [],
    leaseTerms: [],
  },
]

const rooms = [
  { id: 'r-ms1', propertyId: MEADOWS, name: 'Master Suite 1', bathType: 'ensuite', rent: 950, status: 'occupied' },
  { id: 'r-ms2', propertyId: MEADOWS, name: 'Master Suite 2', bathType: 'ensuite', rent: 950, status: 'available' },
  { id: 'r-3', propertyId: MEADOWS, name: 'Room 3', bathType: 'shared', rent: 850, status: 'occupied' },
  { id: 'r-4', propertyId: MEADOWS, name: 'Room 4', bathType: 'shared', rent: 850, status: 'occupied' },
  { id: 'r-5', propertyId: MEADOWS, name: 'Room 5', bathType: 'shared', rent: 850, status: 'occupied' },
]

const tenants = [
  { id: 't-jordan', propertyId: MEADOWS, roomId: 'r-ms1', name: 'Jordan Reyes', occupation: 'Travel nurse at Salem Health', leaseStart: '2026-04-01', leaseType: '6mo+', savingsGoal: SAVINGS_GOAL, isDemoTenant: true },
  { id: 't-priya', propertyId: MEADOWS, roomId: 'r-3', name: 'Priya Nair', occupation: 'State employee, Oregon Dept. of Revenue', leaseStart: '2026-03-01', leaseType: '6mo+', savingsGoal: SAVINGS_GOAL, isDemoTenant: false },
  { id: 't-marcus', propertyId: MEADOWS, roomId: 'r-4', name: 'Marcus Bell', occupation: 'Military, Oregon National Guard', leaseStart: '2026-05-01', leaseType: '6mo+', savingsGoal: SAVINGS_GOAL, isDemoTenant: false },
  { id: 't-elena', propertyId: MEADOWS, roomId: 'r-5', name: 'Elena Kowalski', occupation: 'Respiratory therapist, Santiam Hospital', leaseStart: '2026-06-01', leaseType: '6mo+', savingsGoal: SAVINGS_GOAL, isDemoTenant: false },
]

const applicants = [
  { id: 'a-sam', propertyId: MEADOWS, roomId: 'r-ms2', name: 'Sam Okafor', occupation: 'Software developer relocating from Portland', leaseType: '6mo+', status: 'submitted', submittedAt: '2026-10-14T10:20:00' },
  { id: 'a-taylor', propertyId: MEADOWS, roomId: 'r-ms2', name: 'Taylor Brooks', occupation: 'Hospital lab tech', leaseType: 'month-to-month', status: 'submitted', submittedAt: '2026-10-16T15:45:00' },
]

// Each inquiry is a chat thread between a renter and property management.
// status is "new" when the renter spoke last (manager owes a reply), "replied" otherwise.
const inquiries = [
  {
    id: 'i-1', propertyId: MEADOWS, roomId: 'r-ms2', name: 'Alex Moreno', status: 'new',
    messages: [
      { id: 'msg-i1-1', from: 'renter', text: 'Hi! Is Master Suite 2 still available for a November move-in? I start at Salem Health next month.', sentAt: '2026-10-15T08:12:00' },
    ],
  },
  {
    id: 'i-2', propertyId: MEADOWS, roomId: null, name: 'Dana Whitfield', status: 'new',
    messages: [
      { id: 'msg-i2-1', from: 'renter', text: 'Do you allow a parking spot for a second car? And is the month-to-month option available right away?', sentAt: '2026-10-17T19:40:00' },
    ],
  },
]

const tours = [
  { id: 'tour-1', propertyId: MEADOWS, name: 'Chris Lindqvist', dateTime: '2026-10-22T17:30:00', withCurrentTenants: true, status: 'scheduled' },
]

const leases = [
  { id: 'l-jordan', tenantId: 't-jordan', signedAt: '2026-03-24T12:00:00', signedName: 'Jordan Reyes' },
  { id: 'l-priya', tenantId: 't-priya', signedAt: '2026-02-20T12:00:00', signedName: 'Priya Nair' },
  { id: 'l-marcus', tenantId: 't-marcus', signedAt: '2026-04-25T12:00:00', signedName: 'Marcus Bell' },
  { id: 'l-elena', tenantId: 't-elena', signedAt: '2026-05-22T12:00:00', signedName: 'Elena Kowalski' },
]

// Jordan: Apr–Oct paid = 7 on-time months. Marcus is late this month.
const payments = [
  ...paymentHistory('t-jordan', '2026-04-01', 950, 'paid'),
  ...paymentHistory('t-priya', '2026-03-01', 850, 'paid'),
  ...paymentHistory('t-marcus', '2026-05-01', 850, 'late'),
  ...paymentHistory('t-elena', '2026-06-01', 850, 'paid'),
]

const maintenance = [
  { id: 'm-1', propertyId: MEADOWS, roomId: 'r-4', tenantId: 't-marcus', issue: 'Shared bathroom fan is loud', status: 'open', createdAt: '2026-10-12T09:00:00' },
]

// Returns a fresh copy each time so nothing can accidentally mutate the seed.
export function makeSeed() {
  return structuredClone({
    version: SEED_VERSION,
    properties, rooms, tenants, applicants, inquiries, tours, leases, payments, maintenance,
  })
}
