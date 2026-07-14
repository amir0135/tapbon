# Spec: Issue receipt (dashboard)

**Purpose:** Merchant issues a sale → immutable receipt is created and a link/QR is shown.

- Route: `/dashboard/receipts` (auth required, existing session auth).
- If the user has no merchant profile yet: inline setup card (business name, CVR, currency DKK/SEK/NOK/EUR) — one-time.
- Form: item rows (name, qty, unit price incl. VAT in kr — stored as øre, VAT rate select 25%/12%/6%/0%), add/remove row, running total.
- Submit → server action: validate (zod), compute per-rate VAT breakdown (lib/vat), SHA-256 hash of canonical receipt JSON, insert receipt + items in one tx. Receipts are NEVER updated.
- After issue: success panel with public URL `/r/[id]`, QR code of it, "issue next" button.
- Below form: list of last 10 receipts (number, time, total, link).
- Empty state: friendly first-receipt prompt. Errors: inline, i18n. All strings da/en via next-intl.
