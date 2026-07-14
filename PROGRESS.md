# Progress

## Last session (2026-07-14, night)
Tapbon Bridge fase 1 (SaaS-siden af printer-emuleringen, spec v2): migration
0002 (terminals + deviceTokenHash/lastSeenAt; receipts + kind/status/
confirmationCode/expiresAt/claimedAt/printJobId; ny receipt_files bytea-tabel —
Blob-kontoen er policy-låst ligesom Key Vault). POST /api/bridge/receipts
(Bearer deviceToken, multipart PNG/PDF, magic-byte sniff, idempotent på
terminal+printJobId, nyt job udløber gamle pending). Claim-flow skrevet om til
atomisk UPDATE (første tap vinder, pending→claimed, kun leverings-metadata
opdateres) med 4-cifret confirmationCode på bridge-svar og /r-siden. /r/[id]
renderer fil-kvitteringer (img/PDF via /api/receipts/[id]/file, "rå
kvittering"-note); dashboard fik Bridge-kort til enheds-nøgle. E2E lokalt:
upload → tap → claim → andet tap venteskærm; idempotens, supersede, 401.
Prod-build grøn.

## Previous session (2026-07-14, eve)
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
Deploy + smoke-test bridge/stand/onboarding in prod. Bridge fase 2:
9100-emulator på laptop efter docs/pos-test-plan.md (Zettle Go som test-POS).
Så: tapbon.dk-domæne, find 2–3 pilot caféer og print deres stands.

## Parked decisions
- Printer-emulering spec v2 (specs/printer-emulation.md): fase 1 (SaaS-siden) er
  BYGGET. Næste ryk = fase 2-emulator (docs/pos-test-plan.md); bridge-klienten
  kan udliciteres; hardware først efter bevist pilot.
- MitID auth? Revisit at Phase 6.
- Key Vault kv-tapbon-prod: tenant policy forces publicNetworkAccess=Disabled —
  secrets live in App Service settings for now.
- Starter uses its own JWT auth (jose), not Auth.js — swap decision pending.
- Locale routing (/da, /en) vs cookie-only — cookie-only for now.
- Real PDF generation (playwright/react-pdf) — print dialog is the MVP answer.
