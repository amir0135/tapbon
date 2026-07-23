# Spec: Enheder (merchant devices, 2026-07-23)

Receiptile-paritet for merchant-backend'en, slice 1: en "Enheder"-side i
dashboardet, så butikken kan se og administrere sine terminaler/brikker
(i dag findes kun ét Bridge-kort på Oversigt, bundet til default-terminalen).

**Side:** /dashboard/devices (sidebar-item "Enheder", Nfc-ikon). Server
component henter merchantens terminaler (listTerminals) → client-liste.

**Pr. terminal (kort):**
- Navn — klik-for-omdøb inline (samme mønster som kundens konto-rækker).
- Status-chip: Online (lastSeenAt < 3 min — samme regel som Oversigt),
  ellers "Sidst set {relativ tid}" / "Aldrig forbundet".
- publicId (mono) + antal boner.
- Links: offentlig tap-side /t/[publicId] og QR-stand /t/[publicId]/stand.
- Bridge-token: chip "Token sat"/"Intet token" + Generér/Rotér-knap;
  plaintext (tb_…) vises ÉN gang m/ kopiér-knap (kun hash gemmes).

**Opret terminal:** navnefelt + knap; publicId = randomBytes(6) base64url
slice 8 (samme som createMerchant). Slet terminal er OUT OF SCOPE
(receipts har FK; arkivering kommer senere).

**Actions (lib/receipts/actions.ts, ejerskabs-tjek merchantId):**
createTerminal(name), renameTerminal(terminalId, name),
generateDeviceToken(terminalId?) — terminalId valgfri (default-terminal
som i dag, så Bridge-kortet på Oversigt fortsat virker).

**i18n:** ns 'devices' (da/en) + dash.navDevices.
Out of scope: slet/arkivér terminal, flere merchants pr. bruger, brik-
provisionering (NFC-skrivning), Enheder på mobil-bundnav.
