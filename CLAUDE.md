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
applicants:   id, propertyId, roomId, inquiryId, tenantId, name, occupation, leaseType, status ("submitted" | "approved" | "rejected"), submittedAt, isDemoApplicant
              (inquiryId: the chat they applied from, if any. tenantId: set when approved.)
inquiries:    id, propertyId, roomId, tenantId, name, status ("new" | "replied"), messages[]   (a chat thread)
              (tenantId: set when the thread belongs to a current tenant, e.g. Jordan's)
              messages: id, from ("renter" | "manager" | "system"), text, sentAt, type ("text" | "tour_offer" | "apply_invite" | "system")
                        tour_offer also has: slots[], withCurrentTenants, chosenSlot
tours:        id, propertyId, inquiryId, applicantId, name, occupation, roomId, dateTime, type ("in_person" | "with_tenants" | "video"),
              withCurrentTenants (bool, mirrors type for the tenant side), status ("scheduled" | "completed" | "no_show" | "applied"), confirmed (bool), note
              (Tours a renter books in the chat only have id, propertyId, inquiryId, name, dateTime, withCurrentTenants, status.
               The manager's Tours tab fills in room, type, and occupation from the chat and application, and shows a tour as
               "applied" once its prospect has an application.)
leases:       id, tenantId, signedAt, signedName
payments:     id, tenantId, month ("2026-04"), amount, status ("paid" | "late" | "due"), reportedToCredit (bool)
maintenance:  id, propertyId, roomId, location, tenantId, issue, category ("Plumbing" | "Appliance" | "HVAC" | "Electrical" | "General"),
              cost, vendor, status ("open" | "in_progress" | "done"), createdAt, resolvedAt
              (roomId for a tenant's room; location, e.g. "Kitchen", for shared spaces. cost, vendor, resolvedAt are null until known.
               Marking a ticket done stamps resolvedAt; reopening clears it. Tickets the tenant submits from My Home have no category or cost yet.)
```

Separately, `onramp-session` holds who the tenant tab is: `inquiryId` and `applicantId` for the live renter, and `viewAs` (an applicant or tenant id, empty for the live renter) for the sidebar's "viewing as" switcher.

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
- Sam Okafor, software developer relocating from Portland, 6mo+ lease, submitted (demo applicant, `isDemoApplicant`)
- Taylor Brooks, hospital lab tech, month-to-month, submitted

### Other seed items
- 2 new inquiries
- 6 tours, all for Master Suite 2 (no one is named Chris; that's the real property manager's name):

| Date | Prospect | Occupation | Type | Status | Note |
|---|---|---|---|---|---|
| Oct 8, 6:00 PM | Riley Chen | Nursing student | In person | no-show | No reply to two follow-up texts |
| Oct 11, 11:00 AM | Sam Okafor | Software developer relocating from Portland | Video | applied (`a-sam`) | Asked about desk space; applied Oct 14 |
| Oct 13, 5:30 PM | Taylor Brooks | Hospital lab tech | With current tenants | applied (`a-taylor`) | Met Priya and Elena; applied Oct 16 |
| Oct 16, 12:00 PM | Jamie Ortiz | Physical therapist, travel contract | In person | completed | Has a dog; no pets, so no application |
| Oct 29, 5:30 PM | Morgan Ellis | ER nurse starting at Salem Health | With current tenants | scheduled, confirmed | Wants to meet housemates |
| Nov 2, 10:00 AM | Avery Thompson | Middle school teacher | Video | scheduled, not confirmed | Moving from Bend |
- Maintenance tickets (The Meadows House), $625 spent this year:

| Created | Where | Category | Issue | Cost | Vendor | Days | Status |
|---|---|---|---|---|---|---|---|
| Apr 14 | Kitchen | Appliance | Garbage disposal replaced | $185 | Appliance repair tech | 2 | done |
| Jun 9 | Common areas | General | Smoke detector batteries | $25 | In-house handyman | 1 | done |
| Jul 8 | Whole house | HVAC | AC service and filters | $140 | HVAC contractor | 3 | done |
| Aug 19 | Laundry | Appliance | Washer drain hose | $90 | Appliance repair tech | 2 | done |
| Sep 23 | Shared bathroom | Plumbing | Faucet cartridge | $65 | Plumber | 1 | done |
| Oct 3 | Master Suite 1 (Jordan Reyes) | Electrical | Loud bathroom fan replaced | $120 | Electrician | 3 | done (matches Jordan's chat) |
| Oct 12 | Room 4 (Marcus Bell) | General | Shared bathroom fan is noisy | – | – | – | open |
- Jordan's past chat with property management (status "replied", tied to Jordan by `tenantId`):
  - Jordan (Oct 3): "Hi! The fan in my bathroom has started making a loud rattling noise."
  - Manager (Oct 3): "Thanks for letting us know, Jordan. We'll send someone Thursday afternoon."
  - Jordan (Oct 6): "Fan's fixed, thank you!"

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

Keep these numbers in one `constants.js` file so they're easy to change. That includes `HOME_PRICE` and `DOWN_PAYMENT_PCT`; `SAVINGS_GOAL` is calculated from them. The manager's monthly repair budget, `REPAIR_BUDGET_MONTHLY` ($350), lives there too.

## Features

### Tenant view
**Layout.** No top tabs. Every tenant page sits beside a left sidebar (`TenantLayout` + `TenantSidebar`; the logic lives in `src/data/viewer.js`). From top to bottom:
- **"Demo: viewing as" switcher**: the live renter (whoever is clicking through the flow), the demo applicant (Sam Okafor), and the demo tenant (Jordan Reyes). Switching jumps to that person's current stage.
- **Journey stages**, in order: **1. Find a room** (mission banner, listing, room picker) → **2. Move in** (tour, apply, status, sign) → **3. My Home** (savings dashboard). Each stage is done (✓), current (highlighted), or locked (greyed out with 🔒, not clickable). Opening a locked stage's URL shows a locked notice.
  - Still looking (no chat or application): stage 1 current, 2 and 3 locked
  - Has messaged us or applied (e.g. Sam): stage 1 done, stage 2 current, stage 3 locked
  - Signed lease (e.g. Jordan): stages 1 and 2 done, stage 3 current
- **Messages**, pinned at the bottom, separate from the stages: the chat for whoever is being viewed. Shows a dot when management replied last. Only a brand-new renter (no chat, no application, not a tenant) sees the "No messages yet / Browse rooms" empty state. A known applicant or tenant without a thread gets an empty chat box, and their first message starts a thread.

The header keeps only the Tenant / Property Manager toggle. Messaging or applying from the listing always acts as the live renter and switches the sidebar back to them.

1. **Listing page**: a mission banner at the top, above the property name: headline "Rent a beautiful home. Save for your own.", a line of subtext (about $600/mo less than a Salem studio, all in; the difference goes to your down payment, on-time rent builds credit, and the Homebuyer Road Map gets you home), and three steps in a row, Rent → Prepare → Own, with one short line each. Below the banner: photos, embedded YouTube tour, highlights, location tags, house rules, room picker showing tier, bathroom type, rent, and availability. Show the savings vs. a studio for each room, plus "Down payment ready in ~N months."
2. **Message property management**: clicking an available room opens a short form (name + message). It starts a chat thread that appears live in the manager inbox. The renter keeps chatting on a Messages page.
3. **Book a tour (in the chat)**: the manager offers 2–3 tour times in the chat, with a "Tour with current tenants" option. The renter taps one to book it. No calendar sync.
4. **Apply (later, by invitation)**: after the tour, the manager clicks "Invite to apply" in the chat. An Apply button appears for the renter (in the chat and on the Move in page) and opens a form with name, occupation, lease type, background check consent. It appears in the manager's applications list.
5. **Sign lease**: lease summary, type your full name, click Sign. Show a "Signed" confirmation with the date.

   Steps 3–5 all live on the **Move in** page as one sequence: Book a tour → Apply → Application status (submitted / approved) → Sign lease. Completed steps are checked, the current step is highlighted and says what to do next, and the lease form appears inline in the Sign lease step. Steps update live as the manager acts in the other tab.
6. **My Home dashboard** (view as Jordan): **the screen that matters most, so give it the most polish.**
   - Big number: total saved vs. a studio so far
   - Progress bar toward the $15,400 down-payment goal, with an estimate of when the goal is reached at the current pace
   - Row of cards: **Rent** (Pay rent button: marks the month paid), **Credit streak** (on-time months in a row), and **Mortgage readiness**, a checklist headed "N of 4 underway" (items with any progress):
     - Rent history reported: N of 12 months (many lenders look for 12; `LENDER_HISTORY_MONTHS`), from payments marked `reportedToCredit`
     - Down payment saved: % of the goal, from the savings math
     - Homebuyer education class and Lender pre-approval: not tracked yet, shown as "Not started"
   - **Payment history**: one compact row of 12 circles for the current lease year (filled green = paid on time, red = late, outlined = upcoming), month initials underneath, and one line: "All N on-time payments reported to the credit bureaus." No per-month badges.
   - **Homebuyer Road Map** drawn as a winding road (`RoadMap.jsx`): an SVG road with a dashed center line, and the 5 milestones (Rent → Build credit → Save → Meet a lender → Buy with Onramp Homes) as signposts. Passed signposts are checked, the current one is highlighted, and ones ahead are greyed. Save stays current (not checked) until the down payment goal is reached. A "You are here" marker sits on the road leading into the current signpost, placed by progress: credit streak toward 6 months while building credit, then down-payment progress while saving (27% for Jordan, between Build credit and Save). The streak card and the Build credit signpost use the same streak number.
   - Submit maintenance request

### Property Manager view
1. **Property switcher**: The Meadows House (live), Onramp Home #2 (coming soon)
2. **Portfolio summary**: total rooms, occupancy %, monthly rent across live properties. A second row of KPI cards underneath (`OperationsSummary.jsx`), also across live properties:
   - **Collected this month**: rent paid vs. total due ($2,650 of $3,500), collection rate %, and who's outstanding (Marcus Bell's late $850)
   - **Maintenance spend (YTD)**: total ticket cost this year, and average per month from the first ticket's month through the current month
   - **Avg. days to resolve**: average of `resolvedAt − createdAt` across completed tickets

   Below the KPIs, a **Homebuyer pipeline** card (`HomebuyerPipeline.jsx`), labeled "Future Onramp Homes clients": every tenant in a live property with % of down payment saved and estimated down-payment-ready month, soonest first. Names open the tenant's profile.

   **Tenant profiles** (`TenantProfile.jsx`): clicking a tenant's name anywhere on the manager side (rent roll, leases, maintenance table, pipeline) opens a panel that slides in from the right. Closes with ×, Escape, or a click outside. It shows:
   - Name, initials avatar, occupation, room, rent, lease type, lease start and end
   - Contact: fake email and phone made from the name (`first.last@example.com`, `(503) 555-01xx`, reserved fictional ranges)
   - Payment history: the same 12-circle strip as the tenant dashboard (`PaymentRow.jsx`)
   - Road Map progress: current stage, % of down payment saved, estimated ready month, with the note "Shared with Onramp coach"
   - Documents with status badges: Signed lease (Signed, or Awaiting signature from lease data), Photo ID (Verified), Background check (Passed), Proof of income (Verified). Clicking one shows a placeholder page preview; there are no real files.
   - Their maintenance tickets, and a button that opens their conversation in the Inbox (or "No conversation yet")

   Savings, ready month, and Road Map stage come from `src/data/progress.js`, which uses the same rules as the tenant's My Home dashboard.
3. **Inbox**: chat threads with renters, newest first, with a reply box. From the chat the manager can offer tour times and invite a renter to apply.
4. **Applications**: approve or reject. Approving moves the applicant into the room as a tenant.
5. **Tours** (`ToursList.jsx`, `TourFunnel.jsx`):
   - **Funnel** for the current month at the top: Tours (dated this month) → Applications (submitted this month) → Leases signed (this month), with the conversion % between each step. Seed data starts at 5 → 2 (40%) → 0 (0%); the live demo adds a tour, an application, and a lease.
   - **Upcoming** (status "scheduled"), soonest first, as cards: prospect name, occupation, room of interest, date/time, type (In person / With current tenants / Video), Scheduled or ✓ Confirmed, and a short note. Actions: **Confirm**, **Reschedule** (an inline date-time picker; a moved tour needs confirming again), **Mark completed**. Confirming or rescheduling a tour booked in the chat also posts a note in that chat. A scheduled tour whose time has passed gets a "Time has passed" badge.
   - **Past** (completed / no-show / applied), newest first, as a table: date, prospect and occupation, room, type, status, note.
6. **Leases**: who's signed, when, and when each lease ends
7. **Rent roll**: each tenant, rent, status this month. Late payments highlighted. "Send reminder" button shows a confirmation message only.
8. **Maintenance**: a bar chart of repair spend by month (`SpendChart.jsx`, plain HTML bars; one bar per month from the first ticket through the current month, by `createdAt`) with a dashed line at the $350/month budget, hover a bar for its total; then the line "Running $X/month under budget" (average monthly spend vs. budget). Below it, a table of tickets, newest first: date, issue (with vendor), room or location (with tenant), category, cost, days to resolve, and a status dropdown.

## Demo script (build toward this)
1. Tenant tab: browse The Meadows House, watch the tour, compare Master Suite 2 vs. a shared room, the savings for each, and how soon each gets you to a down payment.
2. Message property management about Master Suite 2.
3. Manager tab, side by side: the message appears live. Reply and offer tour times; the renter picks one (with current tenants).
4. After the tour, the manager invites the renter to apply. The renter applies; the application appears live in the manager tab. Approve it.
5. Tenant tab: on the Move in page, the status flips to approved; sign the lease.
6. Switch the sidebar's "viewing as" to Jordan; it jumps to My Home: $4,214 saved, 7-month credit streak, progress toward $15,400.
7. Manager tab: 100% occupancy, Marcus flagged late, one open maintenance ticket, Onramp Home #2 in the switcher.

## Build order
- **Mon:** project setup, seed data, data store with `storage`-event sync, header toggle, listing page
- **Tue:** tenant flow: contact, tour, apply, sign
- **Wed:** manager side: switcher, summary, inbox, applications, rent roll, maintenance
- **Thu:** My Home dashboard polish, styling, reset button, deploy to Vercel, rehearse the demo
- **Fri:** buffer

## Out of scope
Real authentication, payments, e-signatures, live video tours, an investor dashboard, mobile app/PWA, a backend database.
