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
- [ ] Polished public receipt page on the real domain (fictional café, moms breakdown, PDF)
- [ ] Loyalty punch card that visibly fills + Google-review button
- [ ] QR stand + NFC sticker pointing at it
- [ ] Hidden admin form to enter a receipt live during a pitch
- [ ] Danish landing page with pricing + "start pilot" button

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
- [ ] ESC/POS printer emulation (Raspberry Pi class device)
- [ ] POS APIs on demand: Zettle first

## Phase 6 — Billing & launch
- [ ] Stripe subscriptions, pricing page, onboarding
- [ ] Pilot with 2–3 Copenhagen cafés

## Wishes / not now
- (park new tool/service ideas here mid-phase)
