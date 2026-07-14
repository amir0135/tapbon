# Spec: Terminal claim (QR/NFC endpoint)

**Purpose:** One printed QR per counter always resolves to the customer's receipt.

- Route: `/t/[publicId]` — terminal's stable public slug (what the QR/NFC tag encodes).
- Behavior: redirect to the merchant's most recent receipt issued within the last 15 min (claim window).
- If none in window: friendly page "No recent receipt — ask the staff" (da/en), merchant name shown.
- Terminals auto-created: one default terminal per merchant on first receipt ("Kasse 1").
- Dashboard shows the terminal URL + QR to print.
- Out of scope: multi-terminal management UI, one-time claim locks (Phase 3).
