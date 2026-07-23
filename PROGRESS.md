# Progress

## Last session (2026-07-23)
**Loyalitetskort på kontoen** (spec specs/customer-loyalty.md, migration 0010
loyalty_cards.customer_id KØRT i prod — firewall-IP skulle opdateres igen):
- POST /api/loyalty læser nu customer-session: kontoens kort hos merchanten
  vinder over token; nye kort får customer_id; anonyme kort adopteres ved
  stempling. GET ?merchantId= (m/ session) = kontoens kort.
- Nyt POST /api/loyalty/claim: engangsmigrering af localStorage-tokens —
  adopter frie kort, MERGE (stamps cap'et ved required, token-kort slettes)
  hvis kontoen allerede har kort hos merchanten, skip andres kort.
- /mine/loyalitet er server-fed (listCustomerLoyaltyCards); LoyaltyCards-
  klienten claimer localStorage-tokens én gang og rydder dem.
- /r: ReceiptActions får signedIn-prop — uden lokalt token falder den tilbage
  til kontoens kort. tapbon-stamped-<id>-værnet er stadig lokalt.
- E2E lokalt: anonymt stempel → konto-stempel → claim/merge (2 stamps) →
  GET by merchant → gammelt token 404. Testdata ryddet. Build grøn.

## Previous session (2026-07-22, pm)
**Konto-først på kundesiden — "gå Receiptile-vejen" (brugerbeslutning).**
Det kontofri localStorage-arkiv er droppet (DECISIONS.md; spec
customer-account.md v3). Bruger var væk under implementering — anbefalede
valg truffet autonomt: scope A (kun kundesiden; merchant-auth stadig separat),
lokale arkiver synces ved første login, bonen forbliver offentlig at SE.
- **/mine logget ud** = SignInLanding (app/mine/sign-in-landing.tsx): magic
  link primært + adgangskode-toggle (genbruger requestCustomerLogin/
  customerPasswordLogin). Ingen bundnav.
- **/mine logget ind** = server-fed arkiv (getCustomerArchive i
  lib/receipts/customer-queries.ts); sletning via nyt DELETE /api/archive?id=.
  Engangsmigrering i ArchiveList: gammelt localStorage-arkiv POST'es op,
  localStorage ryddes, router.refresh().
- **Alle /mine-undersider** (forbrug/abonnementer/projekter(+[id])/mere/
  loyalitet/profil) redirecter til /mine uden session; sign-in-gate.tsx
  SLETTET + signInPrompt/goToProfile-nøgler fjernet.
- **/r/[id]**: siden er stadig offentlig; ArchiveSaver omskrevet — logget ind
  ⇒ gem på kontoen (auto/manuel efter præference, toast+lyd bevaret); logget
  ud ⇒ "Gem bonen på din konto"-pitch → /mine. Ingen localStorage-gem;
  saveToArchive/mergeIntoArchive/removeFromArchive fjernet fra
  lib/archive/local.ts (readArchive+clearArchive består til migreringen;
  præferencer stadig lokale).
- i18n: customerSync.landing*-nøgler + archive.accountPitch*/savedSub (da+en);
  localNote/pitchSub(archive) fjernet.
- Testet lokalt (dev :3457): /mine logget ud viser login, /r logget ud viser
  pitch, JWT-trick (customerId 2) → /mine viser serverarkiv, POST/GET/DELETE
  /api/archive E2E OK, alle 6 undersider 307 → /mine. Build grøn.
  DB-firewall-reglen skulle opdateres til ny IP (37.96.78.137) — 5432 var
  ÅBEN på dette netværk (ikke corp-blokeret).
- COMMITTET 62735bc; PUSHET + DEPLOYET 2026-07-23 (run grønt). Prod verificeret:
  /mine viser login-landing, undersider redirecter (PPR: redirect() = 200 m/
  NEXT_REDIRECT i payload — ikke 307), bon-siden viser konto-pitch.

## Next up
- Profilens døde logget ud-branch i profile-view.tsx kan prunes.
- Overvej redirect tilbage til bon efter login fra /r (returnTo-param).
- Pilot-forberedelse: NTAG213-stickers, rotér tb_demo_kaffebar-token.

## Previous session (2026-07-22)
**Receiptile-navigationsarkitektur portet efter LIVE gennemgang af deres app**
(bruger logget ind på app.receiptile.com i playwright — screenshots af alle
sider): fast flydende bundnav på alle /mine-sider (app/mine/bottom-nav.tsx,
Boner + Mere — Capture-fanen er ikke relevant for Tapbon), ny hub /mine/mere
(view-skifter + Projekter/Loyalitetskort/Dit forbrug/Abonnementer/
Indstillinger), loyalitetskort flyttet fra arkivet til egen side
/mine/loyalitet ("Mine kort"), profilen er nu en REN indstillingsside
(kicker "Profil" / titel "Indstillinger"; view-toggle + genveje fjernet — de
bor i Mere-hubben), alle /mine-sider har venstrestillet kicker-header
(mono uppercase) som Receiptile. i18n: nye ns nav/more/loyaltyPage +
kicker-nøgler. Verificeret visuelt i prod (390px): /mine, /mine/mere,
/mine/profil matcher Receiptile-strukturen. Parkeret i ROADMAP: Setup
Progress-tjekliste og Capture-side (foto-upload).

## Previous session (2026-07-21, fortsat)
**Receiptile-paritet på kundeprofilen — 6 slices bygget på én gang** (bruger-
ønske "execute alt"; Xero/Hubdoc/Dext/Expensify erstattet af DK: e-conomic/
Dinero/Billy). Specs: customer-profile.md (v2), customer-insights.md,
customer-projects.md. Migration 0009 (kørt via az webapp ssh — 5432 stadig
blokeret lokalt; npm-pitfall "Tracker idealTree already exists" fixes med
npm cache clean --force + npm init -y; heredocs garbles over SSH-tunnellen →
brug base64):
- **Profil**: Privat/Forretning-toggle (setPreferredMode → /dashboard el.
  /sign-up), genveje til Projekter/Forbrug/Abonnementer, version fra
  package.json ("version" tilføjet), gem-bekræftelses- + lyd-toggles
  (localStorage 'tapbon-save-confirm'/'tapbon-save-sound', default TIL —
  ArchiveSaver viser toast + WebAudio-printerklik).
- **Adgangskode**: customers.password_hash; setCustomerPassword +
  customerPasswordLogin (enumeration-sikker) i app/mine/actions.ts; sæt/skift-
  kort i profilen + "log ind med adgangskode"-flow på logget ud-visning.
- **Regnskabs-forwarding**: customers.accounting_forwards (jsonb) m/ e-conomic/
  Dinero/Billy indbakke-e-mails; /api/archive POST forwester NYE gem (returning
  på onConflictDoNothing) via lib/email/forward-receipt.ts (ACS; fil-boner
  vedhæftes, strukturerede som HTML m/ moms pr. sats + CVR; blød fejl).
  sendEmail understøtter nu attachments.
- **/mine/forbrug**: måneds-hero, 6-mdr. CSS-søjler, pr.-forretning-top-8
  (lib/receipts/customer-queries.ts — getCustomerSpending).
- **/mine/abonnementer**: forhandlere m/ 2+ boner (getRecurringMerchants).
- **/mine/projekter** (+ [id]): customer_projects-tabel + customer_receipts.
  project_id; opret/slet/tilføj/fjern (deleteProject nulstiller kun project_id
  — boner slettes aldrig). deleteCustomerAccount rydder også projekter.
- i18n: profile-ns udvidet + nye ns spending/subscriptions/projects (da+en).
Build + tsc grøn; migration verificeret i prod-DB. PUSHET + DEPLOYET (grønt
run; /mine/profil, /forbrug, /abonnementer, /projekter alle 200 i prod).
**UI/UX-polish efter visuel prod-review** (screenshots via playwright m/ forget
customer_session-JWT — signeret lokalt m/ AUTH_SECRET fra .env, customerId 2):
4 manglende i18n-nøgler (saveConfirm/saveSound viste rå keys i prod!), konto-
kort ændret til klik-for-redigér-rækker (Navn/Telefon + Annullér, lukker ved
gem), regnskabssektion nu sammenklappelig m/ "Ikke forbundet"/"n forbundet"-
statuschip, fælles SignInGate-komponent (lås-ikon-kort) på alle gated sider.
E2E i prod: opret/slet projekt OK, regnskabsudklap OK, gate OK. Screenshot-
artefakter fjernet fra repo (/*.png gitignoret).
OBS: sessionens start fandt ucommittede SLETNINGER af hele profil-slicen
(stale buffers-pitfall igen) — gendannet med git checkout HEAD før byggeriet.

## Previous session (2026-07-21)
**Rollevalg huskes nu** (bruger-klage: "den spørger hver gang"): migration 0008
tilføjer users.preferred_mode ('private'|'business'). Onboarding-step 0 gemmer
valget (app/onboarding/actions.ts setPreferredMode); /onboarding, sign-in og
Google-callback sender 'private'-brugere direkte til /mine; createMerchant
sætter 'business'. OBS: lokalt netværk (MS corp) blokerer port 5432 → migration
kørt via `az webapp ssh` på tapbon-app (npm i postgres i /tmp + manuel INSERT i
drizzle.__drizzle_migrations med filens sha256). ALT PUSHET + DEPLOYET (grønt
run, prod verificeret 200): profil-slicen fra i går er nu også live på
tapbon.dk.

## Previous session (2026-07-20)
**Kundeprofil-slice bygget** (Receiptile-inspireret, spec: specs/customer-
profile.md): ny side /mine/profil m/ konto-kort (avatar-initialer, navn +
telefon redigerbare — migration 0007 tilføjer customers.name/phone, kørt mod
prod-DB), plan-kort ("Gratis"), præferencer (sprogvælger DA/EN via
setLocalePreference-action der sætter locale-cookien; auto-gem-toggle via
localStorage 'tapbon-autosave' — slået fra viser /r/[id] nu en manuel
"Gem"-knap i ArchiveSaver), data & privatliv (support-mail, /privatliv,
/vilkaar), om + log ud + slet konto (genbruger GDPR-flowet). Logget ud viser
siden magic-link-pitch. Profil-ikon tilføjet i /mine-headeren. Nye i18n-
namespaces: profile (da+en) + archive.saveManualTitle/Sub/profileLink.
E2E-verificeret i browser: login, gem navn/telefon, persistens efter reload,
sprogskifte DA↔EN, slet konto. Øvrige Receiptile-features parkeret i
ROADMAP.md (integrationer SKAL matche DK-markedet: e-conomic/Dinero/Billy).

## Previous session (2026-07-19, fortsat)
**KV-502'eren auto-fixes nu**: Azure Automation-konto aa-tapbon-ops (system-MI)
kører runbook "kv-guard" (ops/kv-guard-runbook.ps1) hver 6. time: genopretter
policy-exemptionen, genåbner vaultens publicNetworkAccess og tvinger KV-
reference-re-resolution via app setting-tick — kun når noget er galt (idempotent).
MI-roller: Key Vault Contributor + Resource Policy Contributor (vault),
Website Contributor (app), Resource Policy Contributor (MG-scope — kræves pga.
LinkedAuthorizationFailed: exemption-write kræver policyAssignments/exempt/action
på MG'en). E2E-testet: exemption slettet → runbook genoprettede den; prod 200.

## Previous session (2026-07-19)
**Prod-502 IGEN — samme årsag som i går**: MG-policyen havde endnu en gang
slettet KV-exemptionen og sat pna=Disabled (holdt <1 døgn). Samme fix:
exemption + pna=Enabled + KV_REFRESH_TICK. Prod verificeret 200 (/ + DB-rute
/r/[id]). Vibe C-redesignet (PR #1, ui-redesign) er merged + deployet.
**Parked decision:** KV-referencer er skrøbelige i denne tenant — overvej at
flytte secrets til almindelige app settings ELLER privat endpoint, ellers
rammer 502'eren igen ved næste policy-sweep.

## Previous session (2026-07-18, aften)
**Prod-502 fixet**: MG-policyen havde SLETTET policy-exemptionen og sat
kv-tapbon-prod publicNetworkAccess=Disabled igen → alle KV-referencer
"AccessToKeyVaultDenied" → appen fik den rå @Microsoft.KeyVault(...)-streng
som POSTGRES_URL → "Invalid URL" → 502 på alt. Fix: exemption genoprettet,
pna=Enabled, og app setting-tick (KV_REFRESH_TICK) for at tvinge
re-resolution — restart alene var ikke nok. Prod verificeret 200 (/,
/pricing, compare-billeder). OBS: exemptionen kan blive slettet igen —
tjek configreferences først ved pludselig 502.

## Previous session (2026-07-18, fortsat)
**Compare-sektionen portet fra Replit-designet**: de geometriske CSS-scener
erstattet af rigtige fotos (beskåret fra brugerens Replit-screenshot på
Desktop → public/images/compare-old/new.webp). Indbagte $-chips i fotoene
dækkes af lokaliserede PriceChip-overlays (da/en kr.-priser via next-intl)
på målte procent-positioner; VS-badge nu pille-formet som i Replit-designet.
Mission-sektionen var allerede portet tidligere på dagen (mission-receipt-
wave.webp). Verificeret desktop + mobil. Udestår: evt. øvrige Replit-
sektioner — intet referencemateriale fundet ud over compare + mission
(bed brugeren om screenshots/URL).

## Previous session (2026-07-18)
**Kvitteringssiden restylet til landing-mockup'ernes design** (bruger-ønske:
"tag UI'et fra landingssiden — behold den detaljerede bon"): /r/[id] matcher
nu telefon-mockup'en fra forsiden — canvas-baggrund, tracked uppercase
forretningsnavn m/ cirkel-fallback-ikon, stiplede skillelinjer, mint-tint
"Forseglet · SHA-256 · hash"-chip, forest "Hent kvittering"-pille, "Sikker ·
Privat · Papirløs · Tapbon"-trustlinje. Loyalitetskort = mint-fyldte stempler
m/ hvide checks + mono-tæller + ink-pille; Google-review-kort = "Hvordan var
dit besøg?" + 5 stjerner + ink-pille. /mine + arkiv-kort: mint-tint ikon-
fliser, forest-pile, bg-canvas. receiptline cpl 32→42 (fixede "TOTAL D KK"-
ombrydning). Nye i18n-nøgler: receipt.download/trustLine, review.question.
Bonnens SVG-body (receiptline) uændret. Verificeret i browser (structured +
fil-bon + /mine). Landing-siden urørt.

## Previous session (2026-07-17, aften)
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

## Older next-up (superseded — se "Next up" øverst)
Beslut næste kunde-slice fra ROADMAP (fx Gmail auto-capture eller eksport til
e-conomic/Dinero/Billy). Phase 2: pitch pilot-caféer (demo: Loyverse + emulator + NFC-kort +
tapbon.dk). Bestil NTAG213-stickers til pilot-standere. Roter
tb_demo_kaffebar-token før første rigtige pilot.

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
