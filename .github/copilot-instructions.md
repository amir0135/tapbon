# Tapbon — project instructions

Digital receipt SaaS for Denmark/Scandinavia (Receiptile-style). Merchant issues a sale → public receipt page → customer opens via QR/NFC → PDF, loyalty, review. Full plan: `docs/build-plan.md`. Current state: `PROGRESS.md`. Irreversible choices: `DECISIONS.md`.

## Stack
- Next.js (App Router) + Tailwind + shadcn/ui — forked from `nextjs/saas-starter`
- Drizzle ORM → Azure Database for PostgreSQL Flexible Server (Sweden Central / North Europe)
- Auth.js (email magic link + Google) — no auth vendors
- Azure App Service (Linux), Azure Blob Storage (logos, PDFs), Key Vault; deploy via GitHub Actions on push
- `receiptline` (npm) renders receipt bodies to SVG/HTML — do not hand-roll a receipt renderer
- Stripe for SaaS billing (Phase 6 only)

## Hard rules
1. **Receipts are immutable.** Once issued, never UPDATE a receipt or its items. Store a SHA-256 hash of the receipt JSON at issue time. Corrections = new receipt referencing the original.
2. **Money is integer øre/öre/cents.** Never floats for amounts. Currency codes: DKK, SEK, NOK, EUR.
3. **VAT ("moms") per rate.** Line items carry a `vat_rate`; receipts store a per-rate breakdown (jsonb). Always display VAT per rate + the seller's CVR/organisationsnummer on receipt pages.
4. **i18n always.** Every user-facing string goes through next-intl (da/en). Never hardcode strings, date, or currency formats. Danish is the primary locale.
5. **EU-only data.** All data and AI calls stay in EU regions (Sweden Central). No third-party trackers on the public receipt page. Customer data is opt-in only (GDPR); deletion flow required.
6. **Design tokens, not ad-hoc styles.** ink `#232B38`, paper `#FFFFFF`, accent `#34C97B`, forest `#3E624C`; radius 1rem cards / full pills; grotesk headings (Schibsted Grotesk), monospace receipt body/labels (JetBrains Mono). Use the Tailwind/shadcn theme — no one-off colors.

## Data model (~6 tables, keep it small)
`merchants` → `terminals` (QR/NFC endpoints) → `receipts` (immutable, hashed) → `receipt_items` → `customers` (opt-in) → `loyalty_cards`.

## Workflow
- **Spec-first.** Each screen gets a 5–10 line spec in `specs/` before implementation. Implement from the spec.
- **One vertical slice at a time.** Never two features in parallel. "Done" = works on a phone.
- **Session ritual.** Start from `PROGRESS.md` "Next up"; at session end update `PROGRESS.md` (Last session / Next up / Parked decisions) and commit.
- The public receipt page is the product — mobile-first, one column, Apple Wallet/Stripe-receipt patterns. Dashboard stays boring (standard shadcn sidebar).
- Don't add new tools/services mid-phase; park wishes in `ROADMAP.md`.
