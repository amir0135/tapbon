# Spec: Kunde-konto (konto-først — Receiptile-vejen, v3 2026-07-22)

Kundesiden er **konto-først**: /mine og alle undersider kræver kunde-login.
Det kontofri localStorage-arkiv er droppet (DECISIONS.md 2026-07-22 pm).
Bonen på /r/[id] er stadig offentlig at SE — kontoen skal kun til at GEMME.

**Datamodel:** `customers` (id, email unik, loginTokenHash/-Expires til magic-link
— 15 min, SHA-256; valgfri passwordHash) + `customer_receipts` (customerId,
receiptId, savedAt; unik pr. par). Ingen snapshots — arkivet joines live.

**Auth:** separat fra merchant-auth (gennem piloten). Magic-link →
GET /api/customer/verify?token= → httpOnly-cookie `customer_session` (jose JWT,
365 dage, AUTH_SECRET). Alternativ: adgangskode-login. Helper lib/auth/customer.ts.

**/mine (logget ud):** SignInLanding — velkomstkort med magic-link-formular
(+ adgangskode-toggle). Ingen bundnav. Alle /mine-undersider redirecter til
/mine uden session (sign-in-gate.tsx er slettet).

**/mine (logget ind):** arkivet hentes server-side (getCustomerArchive) og
renderes som liste; sletning = DELETE /api/archive?id=. Diskret
"Synkroniseret som x"-linje. Bundnav som før.

**Migrering:** ved første besøg på /mine med session PUSH'es evt. gammelt
localStorage-arkiv (POST /api/archive med ids), localStorage ryddes, og
listen refreshes. Engangsbro — kan fjernes efter piloten.

**/r/[id]:** logget ind ⇒ auto-gem til kontoen (respekterer auto-gem-præference;
fra ⇒ manuel Gem-knap) + bekræftelses-toast/lyd. Logget ud ⇒ pitch-kort
"Gem bonen på din konto" → /mine (login). Ingen localStorage-gem.

**Præferencer** (auto-gem, gem-bekræftelse, lyd) forbliver device-lokale
(lib/archive/local.ts). Loyalitetskort forbliver localStorage indtil videre
(egen slice at flytte dem til kontoen — ROADMAP).

**Privatlivspolitik**: kundekonto-sektion (e-mail gemmes, kvitteringslinks,
sletning). Alle strings da/en.
Out of scope: sammenlægning med merchant-konto (Fase 6), Gmail-import,
notifikationer.
