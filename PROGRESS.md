# Progress

## Last session (2026-07-15)
Prod smoke-test af bridge på tapbon.dk: upload → første tap claimer (streamet
NEXT_REDIRECT), andet tap venteskærm, fil-stream 200. Byggede Bridge fase 2:
printer-emulatoren (bridge-emulator/emulator.py, Python + zeroconf/Pillow/
requests i egen venv). Lytter på TCP 9100, annoncerer sig via mDNS som EPSON
TM-m30II, minimal ESC/POS-parser (CP865 → æøå OK, skipper bitmaps/stregkoder,
cut = job-grænse + idle-timeout), renderer visuelt til PNG, uploader til
/api/bridge/receipts, offline-kø med 30 s retry, svarer DLE EOT "online".
E2E verificeret lokalt: nc-printjob → PNG → upload → tap-claim 307 — køen
beviste sig selv undervejs. MILEPÆL samme aften: **rigtig POS-app testet OK** —
Loyverse POS (tablet) tilføjede emulatoren som Epson/Ethernet-printer via IP,
testprint modtaget, uploadet og claimet på tapbon.dk. Loyverse sender bonen som
GS v 0 raster-striber → emulator opgraderet til at afkode og samle dem til
bonbillede (første forsøg viste [logo]-linjer; fixet + verificeret med rigtigt
print, kode 9451). Zettle kræver CVR ved signup — Loyverse er test-POS'en.
PITFALL: en stale editor-session havde gemt gamle buffere oven i 6 bridge-filer
(ren revertering til e72dc81) — gendannet med git checkout HEAD. Domæne i går
aftes: tapbon.dk + www LIVE (Simply DNS, managed certs, BASE_URL opdateret).

## Previous session (2026-07-14, night)
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
Test emulatoren mod rigtig POS-software: Zettle Go på tablet efter
docs/pos-test-plan.md fase 0/0b. NFC-tags (NTAG213) med tapbon.dk-URL.
Derefter Phase 2: pitch pilot-caféer.

## Parked decisions
- Printer-emulering spec v2: fase 1 (SaaS) + fase 2 (emulator) BYGGET.
  Næste ryk = Zettle Go-test (docs/pos-test-plan.md); hardware først efter
  bevist pilot.
- MitID auth? Revisit at Phase 6.
- Key Vault kv-tapbon-prod: tenant policy forces publicNetworkAccess=Disabled —
  secrets live in App Service settings for now.
- Starter uses its own JWT auth (jose), not Auth.js — swap decision pending.
- Locale routing (/da, /en) vs cookie-only — cookie-only for now.
- Real PDF generation (playwright/react-pdf) — print dialog is the MVP answer.
