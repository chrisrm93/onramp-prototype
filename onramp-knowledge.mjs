// ---------------------------------------------------------------------------
// ONRAMP CHATBOT KNOWLEDGE
// This is the only file you need to edit to change what the chatbot knows.
//
// Rules for editing:
//  - Write facts in plain sentences, one per line.
//  - Anything marked "(not set yet)" makes the bot say the manager will confirm.
//    Replace it with the real answer when you have one.
//  - Never put private information here (tenant names, door codes, the API key).
//    Everything in this file can end up in a reply to a stranger.
// ---------------------------------------------------------------------------

export const CONTACT = {
  // Shown to visitors when the bot hands off or something goes wrong.
  email: "", // e.g. "amanda.miller0604@gmail.com"
  phone: "", // e.g. "(360)-624-7239"
  // For current tenants reporting an urgent repair (water leak, no heat, lockout).
  emergencyPhone: "",
  // Optional: a scheduling link (Calendly, Google Calendar booking page, etc.).
  tourLink: "",
};

export const FACTS = `
ABOUT ONRAMP
- Onramp Living rents private rooms in purpose-built shared homes for working adults who want to save toward owning a home.
- The goal is a path from renting a room to owning a home: rent for less, save and prepare with the Homebuyer Road Map, then buy.
- Onramp Homes is Onramp's real estate brokerage. It can help Road Map graduates buy a home, but tenants can buy with any agent.

LOCATION
- Current home: Keizer, Oregon, in the Salem area.
- Street address: (1325 oppek st NE, Keizer Oregon)
- More homes: Onramp plans to open more purpose-built homes in the Salem area. Timing: (April 2027)

ROOMS AND RENT
- Average room rent is about $800-$1050 a month. Exact rent depends on the room: Shared bathroom rooms are $800, Downstairs Master is $1000, Upstairs Master is $1050
- Rent includes utilities and free parking. There are no junk fees.
- Common areas are furnished and appliances are provided. Tenants just bring a bed.
- Maid service cleans the shared spaces.
- Every room is private.
- Compared with renting a studio in Salem, an Onramp room saves about $600 a month all in. This is an estimate based on a studio costing about $1,357 rent, about $150 utilities, and about $45 parking.
- The home has been fully occupied and rooms fill quickly. Current availability: (not set yet). Visitors can ask to be added to the waitlist.

LEASE AND MOVE-IN
- Lease length: (not set yet)
- Security deposit: (half 1st months rent)
- Application fee and how to apply: (Apply through OnRamp)
- Pets: No Pets
- Smoking: No Smoking
- Guests and overnight visitors: Allowed with landlord approval

CREDIT BUILDING
- Onramp reports tenants' on-time rent payments to the credit bureaus, which can help build a credit history for a mortgage.

HOMEBUYER ROAD MAP (for tenants who want to buy a home)
- Tenants earn a credit equal to 10% of every on-time rent payment.
- The credit vests after 6 months in good standing.
- The credit is paid into escrow toward the home purchase once contingencies clear. It is not paid out as cash.
- Tenants can buy with any real estate agent. The credit never depends on using Onramp Homes.
- If a tenant moves to another rental, they must close on a home within 12 months to use the credit.
- The credit is capped at 3% of the purchase price.
- Support includes HUD-approved homebuyer education, a personal financial plan with check-ins, guidance on Oregon down payment assistance, lender introductions, and quarterly progress statements.
- The Road Map has milestones: enroll, set the destination, credit tune-up, homebuyer education, credit vests, halfway check-in, pre-approval, house hunting, under contract, and Keys Day (moving into their own home).
- Example only: a tenant who saves the roughly $600 monthly difference versus a studio could have about $25,000 by year three, including about $3,420 in Road Map credit. Actual results depend on the person.
- Final program terms are still being reviewed by a real estate attorney, a CPA, and partner lenders.

TOURS
- Tours are with the manager. How tours are scheduled: the bot collects the visitor's name, contact, and times that work, and the manager confirms.
- There is a video tour of the current home on YouTube. Link: (not set yet)
`;
