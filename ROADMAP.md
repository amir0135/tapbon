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
- [ ] NFC-tags (NTAG 213) skrevet med terminal-URL

## Phase 2 — Sell, then pilot (Wizard-of-Oz)
- [ ] Pitch; sign 3–5 pilots (~DKK 199–249/mo, free period first)
- [ ] Run first pilot concierge-style, one dense neighborhood

## Phase 3 — Productize what the pilot proved
- [ ] Data model hardening; per-terminal QR/NFC claim windows
- [ ] Loyalty + review flows as the pilot shaped them
- [ ] Admin screen (you are the dashboard); simple analytics

## Phase 4 — NFC hardware
- [ ] NTAG 213/216 tags + 3D-printed housing

## Phase 5 — Capture ladder & integrations
- [ ] Accounting export: e-conomic, Dinero, Billy (before printer emulation)
- [x] Printer-emulering, SaaS-siden (Bridge fase 1: /api/bridge/receipts, fil-kvitteringer,
      atomisk claim + confirmationCode — specs/printer-emulation.md)
- [ ] Printer-emulering, klient-siden (fase 2: 9100/mDNS-emulator → Zettle-testplan i
      docs/pos-test-plan.md; fase 3: pilot på laptop/Pi)
- [ ] ESC/POS → structured parse (opgraderer fil-kvitteringer)
- [ ] POS APIs on demand: Zettle first

## Phase 6 — Billing & launch
- [ ] Stripe subscriptions, pricing page, onboarding
- [ ] Pilot with 2–3 Copenhagen cafés

## Wishes / not now
- github/spec-kit: overvejet 2026-07-14 — afvist; repoet har allerede spec-first-systemet
  (build-plan/specs/ROADMAP/PROGRESS/DECISIONS). Genbesøg kun hvis workflowet knækker.
- (park new tool/service ideas here mid-phase)
