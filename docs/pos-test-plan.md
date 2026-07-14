# Tapbon — POS Compatibility Test Plan
*Goal: prove that a device impersonating a network receipt printer can capture itemized receipts from the two most important Danish SMB POS systems (Zettle + OnlinePOS), without owning a shop. Total budget: ~€150. Total time: 3–4 weekends.*

---

## Phase 0 — Laptop-only emulator (no hardware, weekend 1)

Before buying anything, prove the concept with your laptop pretending to be a printer.

**Setup**
1. Laptop and a test tablet (any iPad or Android you have) on the same Wi-Fi network.
2. Install the Zettle Go app on the tablet. Create a free Zettle account (no card reader needed — you can create products and "sell" with cash payments for testing).
3. Write a minimal Python script on the laptop that:
   - Listens on TCP port **9100** and dumps everything it receives to a file (raw ESC/POS capture).
   - Responds to **mDNS/Bonjour** announcing itself as a printer (use the `zeroconf` Python library; service types to announce: `_printer._tcp`, `_pdl-datastream._tcp`, `_ipp._tcp`).

**Test**
- In Zettle Go → Settings → Printers → add printer. See if your laptop appears in the list.
- If it doesn't appear via Bonjour: Zettle also supports adding some printers by IP. Try adding the laptop's IP manually.
- Make a cash test sale of 2–3 dummy products → tap print → check the dump file.

**Pass criteria:** bytes arrive in the dump file, and you can see product names and prices in the raw data (open it in a hex editor — ESC/POS is mostly readable text with control bytes in between).

**If Zettle refuses to add the laptop:** it validates the printer model during setup. Move to Phase 0b.

---

## Phase 0b — Impersonate specific printer models

POS apps typically probe the printer to identify it. The two families to impersonate:

**Epson TM-m30II** (the default iPad-POS printer everywhere)
- Discovery: responds on UDP port **3289** (EpsonNet discovery) and via Bonjour with Epson-specific TXT records (`ty=TM-m30II`, `usb_MFG=EPSON`, `usb_MDL=TM-m30II`).
- Print channel 1: raw ESC/POS on TCP **9100**.
- Print channel 2: **ePOS-Print** — HTTP POST of XML to `/cgi-bin/epos/service.cgi?devid=local_printer` on port 80. Many iPad apps use this instead of 9100. Your emulator must run a tiny HTTP server that accepts this POST, returns the success XML response, and saves the body.
- Status: apps may query printer status via ePOS or SNMP (UDP 161, OID for "printer online"). Respond "online, paper OK" or the app may show the printer as unavailable.

**Star mC-Print3 / TSP143IV** (the other family Zettle and many apps support)
- Discovery: Star's own UDP broadcast discovery (port **22222**) plus Bonjour.
- Print: raw StarPRNT/Star Line Mode on TCP 9100 (different command set from ESC/POS — your parser needs both dialects eventually; start with Epson only).
- Note: Star also offers **CloudPRNT**, where the printer polls a cloud URL for jobs. Some POS systems support it — irrelevant for emulation but useful to know it exists.

**Practical shortcut for this phase:** capture how a real printer responds. Buy one used Epson TM-m30 (~€60–90 on DBA.dk — you need one anyway for pass-through testing later). Put it on your network, use Wireshark on your laptop to record exactly what the Zettle app and the printer say to each other during setup and printing. Then make your emulator say the same things. This turns guesswork into copying.

**Pass criteria:** Zettle app lists your emulator as an "Epson TM-m30II", accepts it as the receipt printer, and test-sale receipts land in your dump file.

---

## Phase 1 — Parse the receipts (weekend 2)

1. Run 15–20 varied test sales through Zettle: multiple items, discounts, VAT (25% moms), refunds, item names with æ/ø/å.
2. Write the parser: ESC/POS decode (the `python-escpos` ecosystem helps, but a simple state machine over the byte stream is fine) → output JSON: `{merchant, datetime, items: [{name, qty, unit_price}], vat, total}`.
3. Edge cases to verify: Danish characters (code page CP865/CP1252 handling), long item names that wrap, receipts with logos (skip the bitmap bytes), refund receipts.

**Pass criteria:** 100% of your test receipts parse to correct JSON, including æ/ø/å.

---

## Phase 2 — OnlinePOS (the hospitality half of the market)

OnlinePOS has no free self-serve tier, so:
1. Request a **demo** via onlinepos.dk — say you're building a hardware accessory and need to verify printer compatibility. Vendors do this routinely; they may give you a sandbox login.
2. Alternative: find one friendly café that runs OnlinePOS (ask around — it's everywhere in Copenhagen hospitality) and offer them free lifetime service in exchange for one hour of testing before opening time.
3. OnlinePOS prints to Epson network printers as standard, so your TM-m30II emulator from Phase 0b should slot straight in. Verify discovery works on their setup and that bon layouts parse.

**Pass criteria:** same as Phase 1, on a real OnlinePOS installation.

---

## Phase 3 — Move it to the Pi + add the tile (weekend 3)

1. Port the emulator + parser to a Raspberry Pi Zero 2 W (€20). Same Python code; add: local queue on SD card for offline receipts, retry upload, auto-start on boot, and a captive-portal Wi-Fi setup page so a merchant can connect it to their network without your help.
2. Wire an ST25DV04K breakout (€10) via I2C. After each parsed receipt: POST to your cloud → get short URL → write URL to the tag → pulse the LED.
3. Tile shell: blank acrylic NFC stand (AliExpress) or 86-type panel box with your printed faceplate.

**Pass criteria:** cold start to working in <5 min on a fresh Wi-Fi network; tap on a phone opens the exact receipt of the last transaction; pulling the Wi-Fi mid-day loses zero receipts.

---

## Phase 4 — Pass-through + field pilot (weekend 4 and onward)

1. Add the real printer back: Pi forwards every job to the physical Epson (over the network — the Pi receives on 9100 and re-sends to the printer's IP). Merchant keeps paper capability.
2. Install at 3–5 friendly merchants. Instrument everything: taps per day, parse failures, Wi-Fi dropouts, setup time.
3. Weekly check-ins for a month. The failure list you collect here **is** your product roadmap.

---

## Per-POS compatibility matrix to fill in as you test

| POS | Printer it expects | Discovery works? | Items in stream? | Verdict |
|---|---|---|---|---|
| Zettle | Epson TM-m30 / Star mC-Print | | | |
| OnlinePOS | Epson TM series | | | |
| Shopify POS | Epson / Star | | | |
| Lightspeed | Epson / Star | | | |
| Superb / Flexybox / Ajour | (check docs) | | | |
| SumUp | often no printer → use API instead | n/a | via API | |
| Flatpay / standalone terminals | built-in printer | n/a | no access | skip |

## Shopping list (order this week)

- Used Epson TM-m30 or TM-m30II — DBA.dk, ~€60–90 (reference + pass-through printer)
- Raspberry Pi Zero 2 W + PSU + SD card — ~€35
- ST25DV04K breakout board — ~€10 (Mouser/AliExpress)
- 5× blank NFC acrylic stands + NTAG215 stickers — ~€25
- Used iPad (if you don't have a tablet) — ~€80, or borrow

## Kill criteria (be honest with yourself)

Stop and rethink the approach if: Zettle's printer validation can't be satisfied after capturing a real printer's behavior with Wireshark (unlikely but possible), or if fewer than half of parsed receipts contain line items on real merchant setups, or if merchant Wi-Fi proves so unreliable in the pilot that receipts regularly arrive minutes late. Each has a fallback (Zettle API, totals-only receipts + OCR, LTE dongle) — but you'd want to choose it deliberately, not drift into it.
