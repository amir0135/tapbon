# Progress

## Last session (2026-07-14, pm)
Rebuilt the landing page as a high-fidelity Receiptile-style recreation:
new route app/(marketing)/page.tsx + components/landing/* (scrolly-hero with
pinned 6-panel scrollytelling, dark compare band with VS divider, order band
with Månedlig/Årlig tablist + colour radios + order card, business grid,
mission globe, motion FAQ accordion, dark footer). Design tokens in
lib/design/tokens.ts, plan in specs/landing-page.md. `motion` + lucide added.
Fixed header inverts over dark bands via data-header-dark scroll probe
(mix-blend-difference approach failed). 3 visual passes at 1440/1024/390 vs
reference screenshots (shots/), plus a11y pass: landmarks, heading order,
labelled inputs, aria-expanded FAQ, keyboard toggling, reduced-motion in all
motion components. Old landing (app/(dashboard)/page.tsx) deleted — the
marketing route now owns /.

## Next up
Commit + deploy landing v2. Then Phase 1 polish: real domain (tapbon.dk),
demo café content for pitches, print QR stand PDF.

## Parked decisions
- Printer-emulering (Receiptile-modellen) er spec'et i specs/printer-emulation.md.
  Byg FØRST når en betalende pilot er begrænset af manuel indtastning (Phase 5).
- MitID auth? Revisit at Phase 6.
- Key Vault kv-tapbon-prod: tenant policy forces publicNetworkAccess=Disabled —
  secrets live in App Service settings for now.
- Starter uses its own JWT auth (jose), not Auth.js — swap decision pending.
- Locale routing (/da, /en) vs cookie-only — cookie-only for now.
- Real PDF generation (playwright/react-pdf) — print dialog is the MVP answer.
