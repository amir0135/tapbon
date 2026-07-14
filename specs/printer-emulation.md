# Spec: Printer-emulering (Phase 5, rung 2) — "Tapbon Bridge"

**Purpose:** Kassesystemet "printer" til Tapbon i stedet for papir. Ingen POS-integration, virker med alle systemer der kan printe til en netværksprinter (ESC/POS).

**Enhed:** Raspberry Pi-klasse boks på butikkens netværk. Registrerer sig som netværksprinter (RAW/9100, evt. AirPrint/IPP senere). Samme boks kan huse NFC-brikken.

**Flow:**
1. POS sender ESC/POS-printjob til boksens TCP port 9100
2. Parser oversætter binær strøm → strukturerede varelinjer, beløb, moms (reference: escpos-tools, escpresso, escpos-printer-db — aldrig dependencies)
3. Boksen kalder Tapbon API: `POST /api/bridge/receipts` med terminal-token (ny endpoint, HMAC-signeret)
4. Server validerer, kører VAT-engine som fallback-kontrol, udsteder immutabel kvittering — samme pipeline som formularen
5. Kunden scanner/tapper som i dag (`/t/[publicId]` claim-window)

**Fallback:** Ukendt printerformat → gem rå strøm + AI-oprydning (Foundry, EU) markeret som "ukontrolleret parse" til manuel review.

**States:** Boks offline → POS printer fejler ikke (svar ACK altid, kø lokalt). Parse-fejl → kvittering udstedes ikke, alarm i dashboard.

**Out of scope (v1):** Papir-passthrough (dual print), AirPrint, POS-API'er (Zettle er rung 3), multi-terminal routing.

**Byg først når:** en betalende pilot er begrænset af manuel indtastning (café-volumen). Indtil da er formularen produktet.
