# Progress

## Last session (2026-07-14, eve)
Pilot readiness, three slices: (1) onboarding — sign-in/sign-up now lands on
/dashboard/receipts, CVR placeholder hint (specs/pilot-onboarding.md);
(2) printable A4 QR stand at /t/[publicId]/stand — public route, merchant-locale
strings, browser print = MVP PDF, linked from the terminal card
(specs/qr-stand.md); (3) demo café seed lib/db/seed-demo.ts (`pnpm db:seed:demo`,
idempotent): demo@tapbon.dk / tapbon-demo1, "Kaffebar Botanik" + 10 realistic
DKK receipts through the real computeVat+hash path. Seeded to Azure db
(firewall rule re-pointed to new local IP). Verified stand 200 + claim 307 →
receipt locally.

## Next up
Deploy + smoke-test stand/onboarding in prod. Then: real domain (tapbon.dk),
find 2–3 pilot cafés and print their stands.

## Parked decisions
- Printer-emulering: spec opdateret til v2 (fil-først, virtuel printer-prototype,
  claim + confirmationCode) i specs/printer-emulation.md; POS-testplan i
  docs/pos-test-plan.md. SaaS-siden (fase 1) er næste bridge-slice; bridge-klienten
  kan udliciteres; hardware først efter bevist pilot.
- MitID auth? Revisit at Phase 6.
- Key Vault kv-tapbon-prod: tenant policy forces publicNetworkAccess=Disabled —
  secrets live in App Service settings for now.
- Starter uses its own JWT auth (jose), not Auth.js — swap decision pending.
- Locale routing (/da, /en) vs cookie-only — cookie-only for now.
- Real PDF generation (playwright/react-pdf) — print dialog is the MVP answer.
