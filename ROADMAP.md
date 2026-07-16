# Roadmap

Phases are shippable vertical slices. Finish one before starting the next. Details in `docs/build-plan.md`.

## Phase 0 — Foundation
- [x] Fork `nextjs/saas-starter`, apply design tokens to shadcn theme
- [x] Add next-intl (da/en)
- [x] `npm install receiptline`
- [x] Azure resource group: App Service + Postgres + Blob + Key Vault
- [x] GitHub Actions deploy on push (ship the fork before writing features)
- [ ] Register tapbon.dk + tapbon.app; DKPTO/EUIPO TMview screen for "tapbon"

## Phase 1 — The sales demo
- [x] Polished public receipt page (/r/[id]: moms breakdown, CVR, sealed hash; print dialog = MVP PDF)
- [x] Loyalty punch card that visibly fills + Google-review button
- [x] QR stand: A4 print på /t/[publicId]/stand (NFC-sticker = fysisk opgave, mangler)
- [x] Receipt entry form i dashboard (bedre end "hidden admin form": rigtig merchant-auth + demo café-seed)
- [x] Danish landing page (Receiptile-fidelity, da/en)
- [x] Real domain (tapbon.dk) foran App Service (HTTPS + managed cert; www afventer CNAME-fix hos Simply)
- [x] NFC-kort skrevet med terminal-URL (NFC Tools → https://tapbon.dk/t/fpFALI-3) — tap virker;
      NTAG213-stickers til pilot-caféer når de findes

## Phase 2 — Sell, then pilot (Wizard-of-Oz)
- [ ] Pitch; sign 3–5 pilots (~DKK 199–249/mo, free period first)
- [ ] Run first pilot concierge-style, one dense neighborhood

## Phase 3 — Productize what the pilot proved
- [ ] Data model hardening; per-terminal QR/NFC claim windows
- [ ] Loyalty + review flows as the pilot shaped them
- [ ] Admin screen (you are the dashboard); simple analytics

## Phase 4 — NFC hardware
- [x] Første NFC-kort skrevet og verificeret (tap → kvittering, 2026-07-15)
- [ ] NTAG 213/216 tags + 3D-printed housing (pilot-standere)

## Phase 5 — Capture ladder & integrations
- [ ] Accounting export: e-conomic, Dinero, Billy (before printer emulation)
- [x] Printer-emulering, SaaS-siden (Bridge fase 1: /api/bridge/receipts, fil-kvitteringer,
      atomisk claim + confirmationCode — specs/printer-emulation.md)
- [x] Printer-emulering, emulator (fase 2: bridge-emulator/emulator.py — 9100 + mDNS som
      Epson TM-m30II, ESC/POS+raster→PNG, offline-kø; E2E BESTÅET mod Loyverse POS via
      Ethernet/IP. Zettle-test afventer CVR/pilot-caféens egen konto)
- [ ] Printer-emulering, pilot på laptop/Pi hos kunde (fase 3)
- [ ] ESC/POS → structured parse (opgraderer fil-kvitteringer)
- [ ] POS APIs on demand: Zettle first

## Phase 6 — Billing & launch
- [x] Stripe subscriptions i TEST-mode: produkter (Basis 199/Pro 249), dansk pricing-side,
      webhook, checkout verificeret E2E (live-nøgler + moms/Stripe Tax udestår)
- [ ] Skift til live-nøgler efter Stripe-kontoverifikation (CVR)
- [ ] Pilot with 2–3 Copenhagen cafés

## Wishes / not now
- github/spec-kit: overvejet 2026-07-14 — afvist; repoet har allerede spec-first-systemet
  (build-plan/specs/ROADMAP/PROGRESS/DECISIONS). Genbesøg kun hvis workflowet knækker.
- (park new tool/service ideas here mid-phase)
