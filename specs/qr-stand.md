# Spec: QR stand (printable A4)

**Purpose:** The physical artifact at the till — customers scan it to get their receipt.

- Route: `/t/[publicId]/stand` — public (the QR target is public anyway), no dashboard chrome.
- A4 portrait, print-first: big QR encoding `/t/[publicId]`, headline "Scan din kvittering",
  one-line explainer, merchant name, discreet Tapbon footer.
- Strings via next-intl in the **merchant's locale** (it sits on a Danish counter,
  regardless of the dashboard user's cookie).
- On-screen: a "Print" button (hidden in print CSS) triggers the browser print dialog —
  that is the MVP "PDF" (parked decision in PROGRESS.md).
- Linked from the terminal card on `/dashboard/receipts` (opens new tab).
- Out of scope: fold/cut marks, multiple sizes, custom branding colors.
