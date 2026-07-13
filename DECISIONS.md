# Decisions

One line per irreversible choice. Do not re-litigate.

- 2026-07: Name = **Tapbon** ("bon" = receipt in DK/NO, scales across EU; "tap" universal). Kvit/Kvito/Slip ruled out (collisions).
- 2026-07: Domains = tapbon.dk + tapbon.app; ignore tapbon.com squatter ($25k) until revenue.
- 2026-07: Repo base = fork of `nextjs/saas-starter` (MIT) — keep auth/Drizzle/Stripe/dashboard shell, swap deploy to Azure.
- 2026-07: `receiptline` as npm dependency for receipt rendering (Apache-2.0, keep notices).
- 2026-07: ESC/POS parser (Phase 5) built from scratch; escpresso/escpos-tools are references only, never dependencies.
- 2026-07: Hosting = Azure App Service (Linux); DB = Azure Postgres Flexible Server, Sweden Central/North Europe (EU residency is a selling point).
- 2026-07: Receipts immutable + SHA-256 hash at issue time (tax-record credibility claim).
- 2026-07: Money stored as integer øre; currencies DKK/SEK/NOK/EUR.
- 2026-07: i18n via next-intl from day one; da/en first, sv/no are config.
- 2026-07: Auth = Auth.js magic link + Google; MitID deferred to enterprise demand.
- 2026-07: AI features (Foundry, Sweden Central) follow revenue — none in the demo build.
