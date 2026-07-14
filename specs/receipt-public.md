# Spec: Public receipt page

**Purpose:** The product. Customer opens `/r/[id]` from QR/NFC — mobile-first, one column.

- Route: `/r/[id]` (uuid), public, no auth, no trackers. 404 → friendly "receipt not found".
- White card on soft background: merchant name (+ logo if set), issued date/time (da locale),
  receipt body rendered by `receiptline` (monospace itemization SVG), big total,
  VAT per rate ("Heraf moms 25%: x kr"), CVR-nummer, receipt hash (first 12 chars, "verified" hint).
- Actions (stacked rounded cards, large tap targets): Download PDF (print-optimized), 
  Loyalty card (stamp grid fills per visit, token in localStorage), Google review link (if merchant set one).
- Loading: static (server-rendered). Currency/date formatting via next-intl (da default).
- Out of scope: customer accounts, email receipt, corrections UI.
