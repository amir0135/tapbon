# Spec: Pilot onboarding (merchant, <5 min)

**Purpose:** A café signs up and is ready to issue receipts at the counter fast.

- After sign-up/sign-in, land on `/dashboard/receipts` (the product), not team settings.
- If no merchant: setup form (name, CVR, currency, optional review link) — already exists.
- On create: default terminal "Kasse 1" auto-created (spec: terminal-claim.md);
  page immediately shows issue form + terminal QR + "Print QR-stander (A4)" link.
- CVR field hints 8 digits (DK), stays loose for SE/NO org numbers.
- Out of scope: logo upload, multi-user merchants, email verification.
