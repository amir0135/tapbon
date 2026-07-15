# Spec: Indstillinger & Sikkerhed (da/en) + forretningsprofil

`/dashboard/general` bliver server component med to kort: **Forretning**
(businessName, cvrNumber, logoUrl (URL-felt — upload parkeret til Blob),
googleReviewUrl; valuta vises låst med hint — skift kræver support) via ny
`updateMerchant`-action, og **Konto** (navn/e-mail, eksisterende action).
`/dashboard/security` beholder struktur (adgangskode + slet konto) men alle
UI-strings oversættes. Server-action-beskeder (login/opret/adgangskode/slet/
konto/forretning) oversættes via getTranslations — cookie-locale. Zod-
valideringsfejl forbliver engelske (parkeret). Bemærk: merchant-redigering
ændrer visning af *fremtidige* og historiske kvitteringssider (header læses
live); hash dækker udstedelsesdata — accepteret for MVP.
Out of scope: logo-upload, valutaskift, e-mailverifikation ved skift.
