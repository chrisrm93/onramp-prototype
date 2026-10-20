# Onramp: Prototype

**The onramp from renting to owning.**

Onramp is a professional shared-housing platform for working people in Salem, Oregon. Tenants rent a private room in a brand-new, furnished home for about $600/month less than a studio, all in. That difference goes toward a down payment, on-time rent is reported to build credit, and the Homebuyer Road Map guides each tenant toward buying their own home.

This repository is a clickable prototype of the platform, built for the course *Creating Business Value with AI* at Babson College, Fall 2026.

---

## What the prototype shows

The app has two sides. Switch between them with the toggle in the header.

### Tenant view
- [x] Listing page for The Meadows House: photos, video tour, highlights, location, house rules, lease terms
- [x] Room picker with tiers, rent, availability, and savings compared with a studio
- [ ] Mission banner: Rent → Prepare → Own
- [ ] Book a tour, including tours with current tenants
- [ ] Apply for a room
- [ ] Sign the lease
- [ ] **My Home dashboard**: money saved, progress toward a down payment, on-time rent streak reported to credit bureaus, Road Map steps
- [ ] Chat with property management

### Property Manager view
- [ ] Property switcher and portfolio summary across properties
- [ ] Message inbox
- [ ] Applications: approve or reject
- [ ] Tours, leases, and rent roll showing who's paid and who's late
- [ ] Maintenance requests

## The savings math

| | Studio in Salem | Onramp room |
|---|---|---|
| Rent | ~$1,357 | $850 shared bath / $950 master suite |
| Utilities | ~$150 | Included |
| Parking | ~$45 | Included |
| **All in** | **~$1,552/mo** | **$850–$950/mo** |
| **Monthly savings** | | **$602–$702** |

Tenants also skip about $1,500–$3,000 in furniture, because the home comes furnished. All figures live in `src/constants.js` and are easy to change.

## Demo data

Everything in the app is sample data for demonstration:
- **The Meadows House**, 1325 Oppek St NE, Keizer, Oregon: 5 rooms, 2 master suites with private bathrooms and 3 standard rooms sharing a bathroom
- **Onramp Home #2**: a "coming soon" placeholder showing how the platform scales to more properties
- **Tenants and applicants** are fictional, modeled on the people the house serves: travel nurses, hospital staff, state employees, military personnel, and relocating professionals

There are no real logins, payments, or e-signatures. Data is stored in the browser's `localStorage`, so two tabs of the same browser stay in sync. Use **Reset demo data** in the footer to start over.

## Running it locally

You need [Node.js](https://nodejs.org) installed.

```bash
npm install
npm run dev
```

Then open the address shown in the terminal, usually `http://localhost:5173`.

**Demo tip:** open two browser tabs side by side, one in Tenant view and one in Property Manager view. Actions in one tab appear in the other.

## Built with

- [Vite](https://vitejs.dev) + [React](https://react.dev)
- Plain CSS
- Browser `localStorage` for data
- Built with [Claude Code](https://code.claude.com). `CLAUDE.md` holds the project brief and is the best place to start before making changes.

## Next steps beyond the prototype

- Real accounts for tenants and property managers
- A database and backend in place of `localStorage`
- Online rent payments and reporting to the credit bureaus
- E-signatures for leases
- An investor view for property partners
- The Onramp Homes brokerage step: connecting Road Map graduates with lenders and agents
