# Digital Receipt App — Build Plan (Denmark & Scandinavia)

A phased roadmap for building a Receiptile-style product, software-first, fully self-hosted on Azure with GitHub Copilot as the development workhorse. No builder lock-in. Designed so you can stop and resume anytime without losing your place.

---

## 1\. What you're building (MVP definition)

**Core loop:** Merchant issues a sale → a digital receipt page is generated → customer opens it via QR code (later: NFC tap) → customer can save it as PDF, join loyalty, leave a review.

**MVP scope (Phase 1–3 only):**

- Merchant dashboard: sign up, business profile (CVR/org number, VAT, logo), create/issue receipts  
- Public receipt page: itemized receipt, VAT ("moms") breakdown, PDF download, save-to-phone  
- QR code per merchant/terminal that resolves to the latest receipt  
- Loyalty punch card \+ Google review link (the revenue features Receiptile sells on)

**Explicitly out of MVP:** NFC hardware, POS integrations, accounting-software export, hotels/charge-to-room, multi-venue. These come later as phases — don't touch them until the loop works.

---

## 2\. Architecture

Keep it boring and small. One repo, one app, one Azure resource group.

| Layer | Choice | Why |
| :---- | :---- | :---- |
| App framework | Next.js (App Router) \+ Tailwind \+ shadcn/ui | One codebase for dashboard, public receipt pages, and API routes. SSR makes receipt pages fast on phones with proper link previews. shadcn is copy-paste code you own — Lovable's polish without Lovable |
| Hosting | Azure App Service (Linux) — or Container Apps if you prefer Docker | Simplest Next.js deploy on Azure; GitHub Actions deploy on push |
| Database | Azure Database for PostgreSQL Flexible Server (**Sweden Central or North Europe**) | EU residency is a real selling point vs. Receiptile (they host in the US). Start on the burstable B1ms tier (\~cheap) |
| ORM | Drizzle | Lightweight, type-safe, Copilot autocompletes it well |
| Auth | Auth.js (email magic link \+ Google) | No vendor lock. Add MitID later only if enterprise customers demand it |
| File storage | Azure Blob Storage | Logos, generated PDFs |
| PDF generation | Server route rendering the receipt HTML → PDF (playwright-chromium or @react-pdf/renderer) | Receipt page is already HTML; render it |
| Payments (your SaaS billing) | Stripe (supports DKK/SEK/NOK, MobilePay via Stripe) | Phase 6, not MVP |

**Azure setup (Phase 0):** one resource group, e.g. `rg-{name}-prod`: App Service \+ Postgres \+ Blob \+ Key Vault (secrets). Deploy via GitHub Actions from day one so "deployed" is never a separate project.

**Core data model (keep to \~6 tables):** `merchants` (business info, CVR, VAT no, branding, locale) → `terminals` (QR/NFC endpoints) → `receipts` (immutable once issued, digitally signed hash) → `receipt_items` → `customers` (opt-in only, GDPR) → `loyalty_cards`.

Key design rule: **receipts are immutable and each has a signed hash** (store a SHA-256 of the receipt JSON at issue time). This is your "cannot be altered after issue" claim and matters for tax-record credibility.

---

## 2b. Open-source building blocks (licenses verified July 2026\)

All permissive — safe for a closed-source commercial product. Keep license texts in a `THIRD_PARTY_LICENSES` file.

| Repo | Role | License |
| :---- | :---- | :---- |
| [nextjs/saas-starter](https://github.com/nextjs/saas-starter) | Foundation: Next.js \+ Postgres \+ Drizzle \+ Auth.js \+ Stripe \+ shadcn — fork this as the repo base | MIT |
| [ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) | Reference for multi-tenancy, roles, i18n patterns (mine ideas, don't merge) | MIT |
| [receiptline](https://github.com/receiptline/receiptline) | Receipt markdown standard: one definition renders to SVG/HTML (receipt page) and ESC/POS (printers). Adopt its format early | Apache-2.0 (keep notices) |
| [escpos-tools](https://github.com/receipt-print-hq/escpos-tools) | Parses binary ESC/POS print data — core of Phase 5 printer emulation | MIT |
| [escpresso](https://github.com/jflaflamme/escpresso) | Working virtual ESC/POS printer over TCP (Rust) — reference implementation | MIT |
| [Garletz/escpos-virtual-printer-emulator](https://github.com/Garletz/escpos-virtual-printer-emulator) | Second virtual-printer reference (Rust) | MIT |
| [escpos-printer-db](https://github.com/receipt-print-hq/escpos-printer-db) | Printer quirks database | CC-BY-4.0 (attribution required) |
| [invoify](https://github.com/al1abb/invoify) | Next.js \+ shadcn invoice app — lift VAT/multi-currency/PDF patterns | MIT |

**Decisions (locked):**

- **FORK as repo base:** `nextjs/saas-starter` — keep auth, Drizzle, Stripe, dashboard shell; swap deploy to Azure App Service; add next-intl. Undifferentiated plumbing, don't rebuild it.  
- **DEPENDENCY (npm):** `receiptline` — renders receipt-markdown to SVG/HTML now, ESC/POS later. Industry-standard engine; building one is wasted weeks.  
- **BUILD FROM SCRATCH (the product, proprietary):** receipt data model \+ VAT/moms engine; public receipt page (receiptline renders the body, you own the page); loyalty/reviews/signup; e-conomic/Dinero/Billy exports; Phase 5 ESC/POS parser (written with escpresso \+ escpos-tools open as references — never as dependencies).  
- **MINE ONLY (patterns, never merge):** invoify (PDF, multi-currency), ixartz/SaaS-Boilerplate (multi-tenancy, i18n structure), escpos-printer-db (data \+ attribution, Phase 5).

Hygiene: pin versions, enable Dependabot day one, vendor small utilities instead of adding dependencies, skim anything before it enters the repo. Rationale: fork undifferentiated plumbing, depend on industry standards, hand-build everything a competitor would need to copy.

## 2c. Name & domain (decided, pending domain check)

**Name: Tapbon.** "Bon" is the everyday word for receipt in DK/NO and understood across DE (Kassenbon), NL (kassabon), FR/PL — so the name scales through Europe. "Tap" is the gesture and is universal.

- Ruled out: **Kvit** (Denmark's national quit-smoking app by Kræftens Bekæmpelse, 2025\) and the whole kvit-family (**Kvito** is an existing Danish receipt app). **Slip** — UK digital-receipt startup, £2.5M raised.  
- Domains: tapbon.com is broker-squatted ($25k ask — ignore). Register **tapbon.dk** (check punktum.dk) \+ **tapbon.app** for the product; optionally gettapbon.com as redirect. Revisit the .com only after revenue — squatter asks collapse with time.  
- Before printing anything: 5-minute screen on DKPTO and EUIPO TMview for "tapbon".

## 3\. Denmark/Scandinavia adaptations (your moat)

Bake these in from Phase 1 — they're why a local clone beats the original:

- **i18n from day one.** Danish \+ English first; Swedish/Norwegian are config, not rewrites. Use a standard i18n lib (next-intl), never hardcode strings. Currencies: DKK, SEK, NOK, EUR.  
- **VAT/moms correctness.** 25% standard rate in DK/SE/NO but line-item VAT categories vary. Receipt must show VAT per rate — required for business expense claims. Show seller's CVR-nummer (DK) / organisationsnummer (SE/NO).  
- **Danish Bookkeeping Act (Bogføringsloven).** Danish businesses are now required to keep digital records. A digital receipt that exports cleanly to their bookkeeping system is directly on-trend. **Verify current requirements before marketing claims.**  
- **Accounting integrations (Phase 5):** e-conomic, Dinero, Billy (DK); Fortnox, Visma (SE); Tripletex (NO) — instead of Xero/Dext/Hubdoc.  
- **POS landscape (Phase 5):** Zettle, Vipps MobilePay, OnlinePOS, Flatpay, shopbox — not Square/Toast/Clover. Like Receiptile, start standalone (no POS integration needed) — that's what makes MVP feasible.  
- **GDPR:** EU data residency (done via Supabase region), explicit opt-in for customer signup/loyalty, data deletion flow, no tracking on the public receipt page without consent. Market this loudly.

---

## 4\. Phased roadmap

Each phase is a shippable vertical slice. Finish one before starting the next.

**Phase 0 — Foundation (1–2 evenings)** Fork `nextjs/saas-starter`, apply design tokens, add next-intl (da/en). Azure resource group (App Service, Postgres, Blob, Key Vault) with GitHub Actions deploying on push. Continuity files from section 6\.

**Phase 1 — The sales demo (2–3 weekends) — build this to sell with** Not the product; the demo loop: (a) one polished public receipt page on the real domain — fictional café branding, itemized receipt with moms, loyalty card that visibly fills, Google-review button, PDF download; (b) an NFC sticker (\~5 kr NTAG tag) \+ QR stand pointing at it; (c) a hidden admin form where *you* enter a receipt live during a pitch ("you just sold a cappuccino" → it appears on their tap); (d) a Danish landing page with pricing and a "start pilot" button. No merchant auth, no billing, no dashboard. *Done when: a café owner can tap your stand with their own phone and see a receipt with their own menu items (prep per pitch: \~10 min).*

**Phase 2 — Sell, then pilot Wizard-of-Oz (2–3 weeks, mostly not coding)** Pitch with the demo; target 3–5 signed pilots at \~DKK 199–249/mo (free period, paid after). Run the first pilot concierge-style: you onboard by hand, update content manually, track loyalty in a spreadsheet if needed. One neighborhood, dense — 10 shops on the same street beat 30 across Jutland. *Done when: a real customer taps at a real counter and the merchant sees value.*

**Phase 3 — Productize what the pilot proved (3–4 weeks)** Real data model hardening, per-terminal QR/NFC claim windows, loyalty \+ review flows as the pilot shaped them, simple analytics. Still no self-service merchant dashboard — you remain the dashboard for the first \~10 merchants via an admin screen; build self-service only for what they repeatedly ask. *Done when: a second and third merchant run without your daily involvement.*

**Phase 4 — NFC hardware (later)** An NFC tile is just an NTAG chip encoding your terminal URL — same backend as QR. Buy blank NTAG 213/216 tags (\~5 DKK each), write your URL with any NFC app, put it in a nice 3D-printed housing. No firmware needed for v1.

**Phase 5 — Receipt capture ladder & integrations (later)** How receipts get into the system, in three rungs — climb only when the previous rung is limiting real customers:

1. *Manual entry (Phase 1, already built).* Merchant enters items/amount in the web app. Sufficient for low-volume merchants (salons, mechanics, clinics) and all pilots.  
2. *Printer emulation — the clever middle.* A small device (Raspberry Pi class) that registers as the POS's receipt printer and speaks ESC/POS. The POS "prints" to it; you parse the ESC/POS stream into structured line items and issue the digital receipt. No configuration on the POS side — this is how "works with every POS, no integration" becomes true at café volume (likely Receiptile's own approach). Real engineering and a genuine barrier to copycats. Pairs naturally with the NFC tile: same physical box can host both.  
3. *Official POS APIs — per vendor, on demand.* Zettle first (solid public API, ubiquitous among Danish independents), then Shopify POS, Lightspeed, OnlinePOS. Build each only when paying merchants use that system.

Accounting export (e-conomic/Dinero/Billy) sits alongside this ladder and should come *before* rung 2 — it's the compliance moat and DK accountants are a sales channel.

**Phase 6 — Billing & launch** Stripe subscriptions, pricing page, onboarding flow, pilot with 2–3 Copenhagen cafés.

## 4b. AI roadmap (Azure AI Foundry)

All via Foundry's EU deployments (Sweden Central), data logging off — keeps the "data never leaves the EU" pitch true. None of this enters the demo build; it follows revenue. Ranked by moat value:

1. **Bookkeeping auto-categorization** (with the accounting export, \~Phase 4–5). Small model (GPT-4o-mini class) maps line items to the Danish kontoplan before pushing to e-conomic/Dinero/Billy — "receipt books itself." Strengthens the compliance moat directly. Cost: \~one call per receipt.  
2. **Paper receipt scan-in** (right after \#1). Document Intelligence's *prebuilt receipt model*: photo of any paper receipt → structured items/VAT/total into the customer's Tapbon archive. Makes you system of record for ALL receipts, not just tapped ones — switching-cost play, near-zero build effort.  
3. **Merchant weekly digest in Danish.** Two sentences from their own tap/sales data ("Stamkunder faldt 12% — send et tilbud?"). Replaces the dashboard merchants wouldn't read anyway.  
4. **Review-reply drafting.** One-tap Google-review answers in the merchant's tone.  
5. **ESC/POS cleanup fallback** (Phase 5). Model normalizes raw text when the deterministic parser hits an unknown printer format — protects the "works with every POS" promise at the long tail.

Anti-scope: no chatbot, no "AI assistant" tab, nothing AI-branded on the customer-facing receipt page (GDPR surface \+ demo risk, zero sales value).

---

## 5\. UI/UX without a builder

The smartest path to good UX as a solo developer:

- **Design tokens first.** Set brand colors, font, and border radius once in Tailwind config \+ shadcn theme. Every screen you or Copilot generates afterwards automatically matches. This is 80% of "looks professional."  
- **Spec before code.** For each screen, write a 5–10 line markdown spec (purpose, elements, empty/loading/error states) in a `specs/` folder, then let Copilot generate the component from it. Copilot output from a spec is dramatically better than from an inline comment — and the spec doubles as documentation.  
- **Disposable mockups only.** If you want visual ideation, use v0.dev or Lovable to generate a mockup, copy the shadcn/Tailwind code into your repo, and never sync or host there. They're sketchpads, not infrastructure.  
- **Steal proven patterns.** Public receipt page: model it on Apple Wallet passes and Stripe email receipts — one column, mobile-first, logo top, big total, itemization below, actions (PDF, loyalty, review) as large tap targets at the bottom. Dashboard: standard shadcn sidebar layout; don't innovate there.  
- **The receipt page is the product.** It's what every end customer sees. Spend your design energy there; the merchant dashboard just needs to be clean and fast.

---

## 5b. Design language (inspired by Receiptile's brand, adapted — not copied)

What makes Receiptile's identity work, distilled from their Instagram (@tap.receiptile) and site:

- **Two colors do all the work.** Near-black ink (deep navy-charcoal) for type \+ one green accent (a fresh mint-green for highlights, a muted forest green for full-bleed backgrounds). Everything else is white space. No gradients, no shadows-everywhere.  
- **Big, bold grotesk headlines** with tight line-height, often two-tone within one sentence ("Life's too short to worry **about receipts.**" — last words in the accent green). Small labels/captions in a monospace font — a subtle receipt-printer reference that's cheap to replicate.  
- **One playful line-art mascot/icon** (theirs: a crocodile eating a receipt) reused everywhere at line-icon weight. Give yours its own animal/motif — Nordic options: a fish, a magpie ("skade" collects things), or a simple hand-tap glyph.  
- **Rounded-square softness.** The hardware tile's shape echoes through the UI: generous border radius, cards, pill buttons, one small green status dot as a "live" signal.  
- **Humor-forward, anti-establishment tone** ("printers suck", "and now it's just vibes"). In Danish this translates well to dry understatement — worth keeping.

**Suggested tokens for your Tailwind/shadcn theme:**

ink:      \#232B38   (headings, body)

paper:    \#FFFFFF   (background)

accent:   \#34C97B   (mint green — links, highlights, status dot)

forest:   \#3E624C   (dark green — hero/receipt-footer backgrounds)

radius:   1rem cards / full pills

fonts:    headings+body: a grotesk (e.g. "Schibsted Grotesk" — free, Nordic);

          labels/receipt body: monospace (e.g. "JetBrains Mono" or "Space Mono")

The receipt page itself: white card on soft background, merchant logo top, monospace itemization (leans into the "receipt" metaphor), ink totals with green accents, action buttons as stacked rounded cards below (PDF, loyalty, review). **Copy the patterns, not the assets** — their crocodile, exact copy, and imagery are their IP.

## 6\. Anti-overwhelm system (resume from anywhere)

This is what makes the project survivable. Put these files in the repo root:

**`ROADMAP.md`** — the phases above, as checkboxes. Never more detailed than checkboxes.

**`PROGRESS.md`** — your resume file. Three sections, updated in 2 minutes at the end of *every* session:

\#\# Last session (2026-07-11)

Built receipt page layout; VAT breakdown works.

\#\# Next up

Wire PDF download button to edge function.

\#\# Parked decisions

\- MitID auth? Revisit at Phase 6\.

**`DECISIONS.md`** — one line per irreversible choice ("EU Supabase region: Frankfurt, because…"). Stops you re-litigating old decisions.

**`.github/copilot-instructions.md`** — project context for Copilot (stack, i18n rule, immutable-receipt rule, naming conventions) so every Copilot session starts already knowing the project.

**Session ritual:** open `PROGRESS.md` → do ONE checkbox worth of work → update `PROGRESS.md` → commit. A session can be 30 minutes; the system means zero warm-up cost next time.

**Rules that prevent overwhelm:**

1. One vertical slice at a time — never build two features in parallel.  
2. "Done" \= works on your phone, not "code exists".  
3. If stuck \>45 min on the same problem, write it in Parked decisions and pick a different checkbox.  
4. No new tools/services mid-phase. Add wishes to `ROADMAP.md`.

---

## 7\. First three build steps (Phase 0–1 kickstart with Copilot)

Work spec-first: write the spec in `specs/`, then have Copilot (agent/chat mode) implement it.

1. **Fork \+ deploy pipeline.** Fork `nextjs/saas-starter`, apply your design tokens to its shadcn theme, `npm install receiptline`. Have Copilot write the GitHub Actions workflow for Azure App Service and point Drizzle at Azure Postgres. Ship the forked app to Azure before writing features — deployment problems are cheapest on day one.  
2. **Merchant auth \+ profile.** Spec: Auth.js magic-link login; `merchants` table (business\_name, cvr\_number, vat\_number, logo\_url, locale, currency); settings page to edit it; logo upload to Blob Storage. All strings through next-intl (da/en).  
3. **Receipts \+ public page.** Spec: `receipts` (merchant\_id, issued\_at, total, currency, vat\_breakdown jsonb, hash) and `receipt_items` (name, qty, unit\_price, vat\_rate); dashboard form to issue a receipt with computed VAT per rate; public unauthenticated page at `/r/[receiptId]` — mobile-first, merchant branding, itemized list, VAT per rate, CVR number, Download PDF button.

