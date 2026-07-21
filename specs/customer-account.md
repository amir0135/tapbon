# Spec: Kunde-konto med sync (valgfrit lag — Receiptile-modellen)

Tap forbliver ALTID kontofrit. Kontoen er et valgfrit lag til "gem på tværs af
enheder": e-mail magic-link (ACS), ingen adgangskode.

**Datamodel:** `customers` (id, email unik, loginTokenHash/loginTokenExpires
til magic-link — 15 min, SHA-256) + `customer_receipts` (customerId, receiptId,
savedAt; unik pr. par). Ingen snapshots — arkivdata joines live fra receipts/
merchants ved hentning.

**Auth:** separat fra merchant-auth. Magic-link → GET /api/customer/verify?token=
→ sætter httpOnly-cookie `customer_session` (jose JWT m/ customerId+email,
365 dage, AUTH_SECRET). Helper lib/auth/customer.ts (getCustomer()).

**Sync:** /mine (server component læser customer-session → props til client):
logget ind ⇒ (1) PULL: GET /api/archive (joinet liste) merges ind i localStorage;
(2) PUSH: lokale entries POST'es (kun receipt-ids; server validerer eksistens).
ArchiveSaver på /r POST'er fire-and-forget (no-op uden session). localStorage
forbliver sandhed for anonyme.

**UI på /mine (v2, 2026-07-21):** INTET login-kort på dashboardet — enten har
man en konto (alle features, diskret "Synkroniseret som x@y"-linje), eller også
har man ikke (lokalt arkiv + pitch på bon-siden /r efter print/tap). Konto
oprettes/administreres KUN via /mine/profil (magic link eller adgangskode) og
bon-sidens arkiv-link. Log ud + Slet konto bor i profilen.

**Privatlivspolitik** udvides: valgfri kundekonto-sektion (e-mail gemmes,
kvitteringslinks, sletning). Alle strings da/en.
Out of scope: Gmail-import, scanning, notifikationer.
