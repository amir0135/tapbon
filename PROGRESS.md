# Progress

## Last session (2026-07-14)
MVP live at https://tapbon-app.azurewebsites.net. Built: full receipt domain
(schema + migrations on Azure Postgres), VAT engine, issue form with QR,
public receipt page (receiptline body, moms pr. sats, CVR, hash seal, PDF/print,
loyalty punch card, Google review), terminal claim route /t/[publicId],
Tapbon landing page mirroring Receiptile's structure (da/en). Deploy pipeline
fixed: standalone output + hoisted node_modules + Oryx off + SCM basic auth on.

## Next up
Phase 1 polish: real domain (tapbon.dk), demo café content for pitches, print
QR stand PDF. Then Phase 2: pitch + sign pilots.

## Parked decisions
- MitID auth? Revisit at Phase 6.
- Key Vault kv-tapbon-prod: tenant policy forces publicNetworkAccess=Disabled —
  secrets live in App Service settings for now.
- Starter uses its own JWT auth (jose), not Auth.js — swap decision pending.
- Locale routing (/da, /en) vs cookie-only — cookie-only for now.
- Real PDF generation (playwright/react-pdf) — print dialog is the MVP answer.
