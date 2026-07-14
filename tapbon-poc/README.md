# Tapbon POC

The Phase 1 demo loop, runnable locally. JSON-file storage, no auth, no Azure — throwaway
by design; the pages port into the `nextjs/saas-starter` fork later.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## The demo flow

1. `/admin` — enter the café's real menu items, press **Udsted bon**
2. Scan the QR with your phone (same Wi-Fi: use your machine's LAN IP, e.g. http://192.168.x.x:3000)
3. Phone opens `/t/demo` → redirects to the latest receipt: itemized bon, moms per rate,
   CVR, SHA-256 hash, loyalty stamp card that fills on each visit, Google-review button,
   save-as-PDF.

`/t/demo` is the stable terminal URL — exactly what an NFC tag (NTAG213) should be written
with for counter demos.

## Test on your phone (LAN)

```bash
npm run dev -- -H 0.0.0.0
# find your IP: ipconfig getifaddr en0   (macOS)
```

Then issue a receipt with the LAN URL open in the admin (QR will encode the right host).

## What is deliberately missing

Auth, database, claim windows (anyone scanning sees the latest receipt), multi-terminal,
i18n plumbing. See docs/build-plan.md Phase 3.
