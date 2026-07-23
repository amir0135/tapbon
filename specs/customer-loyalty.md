# Spec: Loyalitetskort på kontoen (konto-først, 2026-07-23)

I dag er stempelkort anonyme: `loyalty_cards.card_token` gemmes i localStorage
(`tapbon-loyalty-<merchantId>`) — de følger enheden, ikke kunden. Efter
konto-først-skiftet (customer-account.md v3) skal kort følge kontoen.

**Datamodel:** `loyalty_cards` får nullable `customer_id` (FK customers,
migration 0010). Anonyme kort (tap uden login) forbliver token-baserede;
et kort med `customer_id` tilhører kontoen. Én konto har højst ét aktivt
kort pr. merchant (håndhæves i claim/stamp-logik, ikke som DB-constraint —
anonyme kort kan stadig være flere).

**Stempling på /r (logget ind):** POST /api/loyalty læser customer-session;
nye kort oprettes med `customer_id`, og eksisterende anonyme kort adopteres
(customer_id sættes) når kontoen stempler dem. Har kontoen allerede et kort
hos merchanten, stemples DET (token ignoreres). Logget ud: uændret anonymt
token-flow.

**Visning på /r:** logget ind uden lokalt token ⇒ GET /api/loyalty?merchantId=
returnerer kontoens kort (404 hvis intet). Ellers token-flowet som før.
`tapbon-stamped-<receiptId>` (dobbelt-stempel-værn) forbliver lokalt.

**Claim/migrering:** POST /api/loyalty/claim { tokens: [] } (auth): pr. token —
skip hvis kortet tilhører en anden konto; adopter hvis frit; MERGE hvis
kontoen allerede har kort hos samme merchant (stamps = min(sum, required),
token-kortet slettes). /mine/loyalitet kører claim som engangs-effekt med
localStorage-tokens og rydder dem bagefter.

**/mine/loyalitet:** kortene hentes server-side via customer_id
(listCustomerLoyaltyCards) — ikke længere localStorage-scanning.

Out of scope: flere kort pr. merchant, kort-deling, merchant-styret
stampsRequired-ændring på eksisterende kort.
