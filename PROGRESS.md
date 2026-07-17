# Progress

## Last session (2026-07-17, aften)
(1) **Key Vault i drift**: MG-policyen MCAPSGovDeployPolicies (modify) tvang
publicNetworkAccess=Disabled — løst med policy exemption "kv-tapbon-exempt"
(Waiver) på vault-scope. Alle 7 secrets (google-client-id/-secret, stripe-
secret-key/-webhook-secret, acs-connection-string, postgres-url, auth-secret)
ligger nu i kv-tapbon-prod; App Service bruger @Microsoft.KeyVault-referencer
via system-assigned identity (Key Vault Secrets User). Prod smoke-testet OK.
HUSK: rotér Google client secret (delt i chat) — opdater KV-secret bagefter.
(2) **Onboarding: forretning/privat-valg** — nyt trin 0 før wizarden:
"Jeg driver en forretning" → 4-trins wizard (m/ tilbage-knap), "Jeg er
privatperson" → /mine (ingen CVR/forretningsspørgsmål). Gælder også Google-
signups. E2E-testet i browser med frisk bruger.

## Previous session (2026-07-17, fortsat)
Valgfri kunde-konto m/ sync bygget (specs/customer-account.md — fremrykket
fra parkering på brugerens ønske): customers + customer_receipts (migration
0006), e-mail magic-link via ACS (15 min engangstoken, enumeration-sikker),
customer_session JWT-cookie (365 d, separat fra merchant-auth), /api/customer/
verify, /api/archive GET/POST (pull-merge + push, joinet live). /mine har
SyncCard: login-formular → "Synket som x@y" + Log ud + Slet konto (GDPR-
sletning). Tap forbliver kontofrit; privatlivspolitik udvidet. E2E: seeded
token → login → push verificeret i db → slet konto → logget ud.

## Previous session (2026-07-17)
Personligt kunde-dashboard på /mine (specs/customer-archive.md v2): "Denne
måned"-kort (forest-baggrund; sum af structured-boner pr. dominerende valuta +
antal), loyalitetskort-sektion på tværs af forretninger (scanner localStorage
tapbon-loyalty-*, GET /api/loyalty udvidet m/ merchantId+merchantName),
bon-liste m/ åbn/fjern. Stadig nul PII. Arkiv-kortet på bonen opgraderet til
tydeligt tilbud ("Alle dine kvitteringer ét sted — ingen konto nødvendig").
Beslutninger parkeret i ROADMAP: shopper-konto = valgfrit lag EFTER pilot
(aldrig tvungen); kunde-app via Universal Links/App Links (samme brik,
browser-fallback), PWA som mellemtrin. PITFALL igen: lokal IP skiftet →
pg-firewall-regel re-peget.

## Previous session (2026-07-16, aften)
To forbruger-/merchant-slices: (1) **Logo-upload** — merchant_logos-tabel
(bytea, migration 0005), uploadLogo/removeLogo m/ magic-byte-validering (png/
jpeg/webp, 1 MB), route /api/merchants/[id]/logo m/ cache-bust, Logo-kort under
Indstillinger; E2E: logo vises på kvitteringen. (2) **Kunde-arkiv "Mine
kvitteringer"** (specs/customer-archive.md) — localStorage på kundens telefon,
nul PII (privatlivspolitikkens løfte holder): /r gemmer automatisk + viser
"Dine kvitteringer (N)"-kort → /mine med liste, åbn/fjern og "kun på denne
enhed"-note. E2E-testet begge. Turbopack-cache korrumperede undervejs (kendt
dev-bug) — fix: rm -rf .next.

## Previous session (2026-07-16, eftermiddag)
Pilot-blokkere lukket (specs/legal-pages.md): (1) /privatliv + /vilkaar —
lyse legal-sider, da/en content-blokke, sandfærdige ift. implementeringen
(ingen shopper-PII, kun tekniske cookies, Azure EU, bogføringslov-retention);
linket fra footer-Jura, auth-sidernes "Ved at fortsætte..." og kvitterings-
sidens footer. SKABELON — juridisk gennemsyn før betalende kunder. (2) Glemt
adgangskode: ACS provisioneret (acs-tapbon + acs-email-tapbon, Europe data-
location, AzureManaged domæne DoNotReply@aadf2091….azurecomm.net), migration
0004 (users.reset_token_hash/expires), forgotPassword/resetPassword actions
(enumeration-sikre, 1 times token), /forgot-password + /reset-password i mørk
auth-stil, link på sign-in. E2E: kendt token → ny kode → session; ACS-send
verificeret (Succeeded). GDPR-sletteflow fandtes allerede (Sikkerhed).

## Previous session (2026-07-16, fortsat)
Onboarding-wizard (Receiptile-mønster, specs/onboarding-wizard.md): sign-up →
/onboarding med 4 trin (forretningstype, kassesystem — Phase 5-guld!, boner/dag,
forretningsinfo). Svar i ny jsonb merchants.onboarding_profile (migration 0003).
Setup-tjekliste på Oversigten (konto/forretning/bridge-nøgle/første bon, %-bar,
skjules ved 100 %). Abonnement-kort under Indstillinger (plan/status + Stripe
kundeportal). E2E-testet: ny bruger → wizard → dashboard 50 % → profil gemt
(zettle/cafe/v100); testdata ryddet op. PITFALL: playwright click hænger på
"element not stable" i delt browser-side — brug evaluate + dispatchEvent.

## Previous session (2026-07-16)
Stripe-billing (Phase 6, TEST-mode): webhook oprettet via Stripe API
(we_1Ttjs6… → tapbon.dk/api/stripe/webhook, subscription.updated/deleted),
produkter Tapbon Basis 199/Pro 249 kr/md m/ 30 dages trial, nøgler i .env +
App Service. /pricing omskrevet: dansk, DKK via formatMoney, Pro fremhævet,
i18n (specs/pricing.md). Checkout E2E-testet med 4242-kort → team fik
plan='Tapbon Basis', status='trialing'. LIVE-nøgler + Stripe Tax udestår
(kræver rigtig konto-verifikation).

## Previous session (2026-07-15, nat)
Settings-slice (specs/settings.md): /dashboard/general = server component med
Forretning-kort (navn, CVR, logo-URL, review-URL via ny updateMerchant; valuta
låst) + Konto-kort; /dashboard/security oversat; action-beskeder (login/opret/
adgangskode/slet/konto) oversat via getTranslations — team-invite-flows stadig
engelske (død kode). FIX: dev HMR lækkede pg-forbindelser ("remaining
connection slots are reserved for SUPERUSER") — lib/db/drizzle.ts genbruger nu
klienten via globalThis + max 5 conns i dev. Verificeret i browser: gem
forretning/konto, sikkerhedsside, da-tekster hele vejen.

## Previous session (2026-07-15, aften)
To slices mod "proper MVP": (1) **Auth-sider i Receiptile-stil**
(specs/auth-pages.md) — mørkt ink-kort, mono-kickers/-labels, vis/skjul
adgangskode, forest pill-knap, mint-links, da/en; ingen døde OAuth/glemt-
adgangskode-knapper. Verificeret desktop+mobil+login-flow. (2) **Dashboard v1**
(specs/dashboard.md) — /dashboard er nu Tapbon Oversigt (nøgletal i dag/7 dage
via getDashboardStats, Bridge online/offline fra lastSeenAt<3 min, seneste 5
boner m/ statusbadges, genveje); sidebar på dansk uden Team/Activity; starter-
Team-siden slettet. PITFALL: Date-params i drizzle sql`` templates fejler i
select-kontekst (postgres-js) — brug ISO-streng + ::timestamp cast. Repo
flyttet til privat amir0135/tapbon (fork slettet, secrets re-sat, deploy grøn).

## Previous session (2026-07-15)
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
NFC-kort skrevet med tap-URL'en (NFC Tools) og verificeret: fysisk tap →
kvittering på telefonen. Hele Receiptile-oplevelsen virker fysisk.
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
Phase 2: pitch pilot-caféer (demo: Loyverse + emulator + NFC-kort + tapbon.dk).
Bestil NTAG213-stickers til pilot-standere. Roter tb_demo_kaffebar-token før
første rigtige pilot.

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
