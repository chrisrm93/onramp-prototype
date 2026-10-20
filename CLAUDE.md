# Onramp Prototype

## What this is
A clickable prototype of **Onramp**, a shared-housing platform that helps working professionals go from renting a room to owning a home. Built for a class demo due **Friday, Oct 23, 2026**.

Onramp has three parts: **Rent** (affordable rooms), **Prepare** (the Homebuyer Road Map: savings, credit-building, a plan to buy), and **Own** (a brokerage). The prototype shows the first two.

The app has two sides, switched with a toggle in the header:
- **Tenant view**: find a room, tour, apply, sign, then track savings toward a home.
- **Property Manager view**: inquiries, applications, tours, leases, rent collection, maintenance.

## Ground rules
- **This is a demo, not a product.** No real logins, payments, e-signatures, or video calls. Fake them convincingly.
- **Keep code simple.** Plain React components and plain CSS. No state libraries, no TypeScript, no backend. Pick the simpler option when in doubt.
- **Comment the goal.** Every component and function gets a short comment explaining *what it's for*, not just what it does.
- **Multi-property from day one.** Every room, tenant, application, payment, and ticket belongs to a `propertyId`. Never hard-code The Meadows House anywhere outside the seed data.
- **Small steps.** Build one feature, check it runs in the browser, then move on.

## Stack
- Vite + React (JavaScript)
- React Router for pages
- Data in `localStorage`, loaded from a seed file on first run
- Deploy to Vercel at the end

### Live sync between tabs
The demo opens two tabs side by side: Tenant in one, Manager in the other. Both read and write the same `localStorage` key. Listen for the browser's `storage` event so a change in one tab, such as a submitted application, shows up in the other tab without a refresh.

### Reset button
Add a small "Reset demo data" button in the footer. It reloads the seed data so the demo can be rerun from scratch.

## Data model
Keep it in one object saved under one `localStorage` key, e.g. `onramp-data`.

```
properties:   id, name, address, neighborhood, status ("live" | "coming_soon"), youtubeId, photos[], highlights[], locationTags[], houseRules[]
rooms:        id, propertyId, name, bathType ("ensuite" | "shared"), rent, status ("occupied" | "available")
tenants:      id, propertyId, roomId, name, occupation, leaseStart, leaseType ("6mo+" | "month-to-month"), savingsGoal, isDemoTenant
applicants:   id, propertyId, roomId, name, occupation, leaseType, status ("submitted" | "approved" | "rejected"), submittedAt
inquiries:    id, propertyId, roomId, name, status ("new" | "replied"), messages[]   (a chat thread)
              messages: id, from ("renter" | "manager" | "system"), text, sentAt, type ("text" | "tour_offer" | "system")
                        tour_offer also has: slots[], withCurrentTenants, chosenSlot
tours:        id, propertyId, inquiryId, name, dateTime, withCurrentTenants (bool), status
leases:       id, tenantId, signedAt, signedName
payments:     id, tenantId, month ("2026-04"), amount, status ("paid" | "late" | "due"), reportedToCredit (bool)
maintenance:  id, propertyId, roomId, tenantId, issue, status ("open" | "in_progress" | "done"), createdAt
```

## Seed data

### Property 1 (live): The Meadows House
- Address: 1325 Oppek St NE, Keizer, Oregon. North Keizer, Meadows neighborhood.
- YouTube tour ID: `bTRJqE3y5uM`
- Photos: `/public/photos/meadows/` (Sharon will add the files)
- Highlights: brand-new construction with modern finishes; open-concept kitchen, living and dining; furnished common areas; kitchen supplies included; large upstairs laundry room with washer/dryer; professional management; maid service for shared spaces once a month; utilities included; free parking
- Location tags: 15 min to Salem Health Hospital; 5 min to I-5; near Keizer Rapids Park; driving distance to Santiam, West Valley, Albany General, and Silverton hospitals
- House rules: all residents background checked; no pets; no couples
- Lease terms: 6 months or longer; month-to-month available for +$50/mo

| Room | Bathroom | Rent | Status |
|---|---|---|---|
| Master Suite 1 | Private en-suite | $950 | occupied |
| Master Suite 2 | Private en-suite | $950 | available |
| Room 3 | Shared, double vanity | $850 | occupied |
| Room 4 | Shared, double vanity | $850 | occupied |
| Room 5 | Shared, double vanity | $850 | occupied |

### Property 2 (coming soon): Onramp Home #2
- Status `coming_soon`, Salem, Oregon, opening 2027
- Purpose-built for room-by-room living, about 11 rooms, $950 average rent
- No tenants. It only appears in the manager's property switcher and portfolio summary, to show the business can scale.

### Tenants (The Meadows House)
| Name | Room | Occupation | Lease start | Payment status this month |
|---|---|---|---|---|
| **Jordan Reyes** (demo tenant) | Master Suite 1 | Travel nurse at Salem Health | 2026-04-01 | paid, 7 on-time months |
| Priya Nair | Room 3 | State employee, Oregon Dept. of Revenue | 2026-03-01 | paid |
| Marcus Bell | Room 4 | Military, Oregon National Guard | 2026-05-01 | **late** |
| Elena Kowalski | Room 5 | Respiratory therapist, Santiam Hospital | 2026-06-01 | paid |

Jordan's savings goal is $15,400, which is a 3.5% FHA down payment on a ~$440,000 Salem home. Every tenant uses this default goal.

### Applicants (for Master Suite 2)
- Sam Okafor, software developer relocating from Portland, 6mo+ lease, submitted
- Taylor Brooks, hospital lab tech, month-to-month, submitted

### Other seed items
- 2 new inquiries, 1 upcoming tour with current tenants, 1 open maintenance ticket ("Shared bathroom fan is loud," Room 4)

## Savings math (the core of the pitch)
A studio in Salem costs about **$1,552/mo** all in: ~$1,357 rent + ~$150 utilities + ~$45 parking. Onramp includes utilities and parking.

- Monthly savings = $1,552 − room rent
  - Master suite: $1,552 − $950 = **$602/mo**
  - Shared-bath room: $1,552 − $850 = **$702/mo**
- Total saved = monthly savings × months paid on time
- Progress = total saved ÷ savings goal
- Savings goal = home price × down payment % = $440,000 × 3.5% (FHA) = **$15,400**
- Months to goal = savings goal ÷ monthly savings, rounded up
  - Master suite: $15,400 ÷ $602 ≈ **26 months**
  - Shared-bath room: $15,400 ÷ $702 ≈ **22 months**
- Plus about $1,500–$3,000 saved on furniture, because the home comes furnished. Show this as a one-time line.

Keep these numbers in one `constants.js` file so they're easy to change. That includes `HOME_PRICE` and `DOWN_PAYMENT_PCT`; `SAVINGS_GOAL` is calculated from them.

## Features

### Tenant view
1. **Listing page**: a mission banner at the top, above the property name: headline "Rent a beautiful home. Save for your own.", a line of subtext (about $600/mo less than a Salem studio, all in; the difference goes to your down payment, on-time rent builds credit, and the Homebuyer Road Map gets you home), and three steps in a row, Rent → Prepare → Own, with one short line each. Below the banner: photos, embedded YouTube tour, highlights, location tags, house rules, room picker showing tier, bathroom type, rent, and availability. Show the savings vs. a studio for each room, plus "Down payment ready in ~N months."
2. **Message property management**: clicking an available room opens a short form (name + message). It starts a chat thread that appears live in the manager inbox. The renter keeps chatting on a Messages page.
3. **Book a tour (in the chat)**: the manager offers 2–3 tour times in the chat, with a "Tour with current tenants" option. The renter taps one to book it. No calendar sync.
4. **Apply (later, by invitation)**: after the tour, the manager clicks "Invite to apply" in the chat. An Apply button appears for the renter and opens a form with name, occupation, lease type, background check consent. It appears in the manager's applications list.
5. **Sign lease**: lease summary, type your full name, click Sign. Show a "Signed" confirmation with the date.
6. **My Home dashboard** (log in as Jordan): **the screen that matters most, so give it the most polish.**
   - Big number: total saved vs. a studio so far
   - Progress bar toward the $15,400 down-payment goal, with an estimate of when the goal is reached at the current pace
   - On-time rent streak, with a "Reported to credit bureaus" badge on each paid month
   - Road Map steps: Rent → Build credit → Save → Meet a lender → Buy with Onramp Homes. Mark the current step.
   - Pay rent button: marks the month paid
   - Submit maintenance request

### Property Manager view
1. **Property switcher**: The Meadows House (live), Onramp Home #2 (coming soon)
2. **Portfolio summary**: total rooms, occupancy %, monthly rent across live properties
3. **Inbox**: chat threads with renters, newest first, with a reply box. From the chat the manager can offer tour times and invite a renter to apply.
4. **Applications**: approve or reject. Approving moves the applicant into the room as a tenant.
5. **Tours**: upcoming tours list
6. **Leases**: who's signed, when, and when each lease ends
7. **Rent roll**: each tenant, rent, status this month. Late payments highlighted. "Send reminder" button shows a confirmation message only.
8. **Maintenance**: tickets with status updates

## Demo script (build toward this)
1. Tenant tab: browse The Meadows House, watch the tour, compare Master Suite 2 vs. a shared room, the savings for each, and how soon each gets you to a down payment.
2. Message property management about Master Suite 2.
3. Manager tab, side by side: the message appears live. Reply and offer tour times; the renter picks one (with current tenants).
4. After the tour, the manager invites the renter to apply. The renter applies; the application appears live in the manager tab. Approve it.
5. Tenant tab: sign the lease.
6. Switch to Jordan's My Home dashboard: $4,214 saved, 7-month credit streak, progress toward $15,400.
7. Manager tab: 100% occupancy, Marcus flagged late, one open maintenance ticket, Onramp Home #2 in the switcher.

## Build order
- **Mon:** project setup, seed data, data store with `storage`-event sync, header toggle, listing page
- **Tue:** tenant flow: contact, tour, apply, sign
- **Wed:** manager side: switcher, summary, inbox, applications, rent roll, maintenance
- **Thu:** My Home dashboard polish, styling, reset button, deploy to Vercel, rehearse the demo
- **Fri:** buffer

## Out of scope
Real authentication, payments, e-signatures, live video tours, an investor dashboard, mobile app/PWA, a backend database.
