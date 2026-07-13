# Progress

## Last session (2026-07-13)
Phase 0 kickoff: merged the amir0135/saas-starter fork into the repo (git history kept).
Installed deps (pnpm) + `receiptline` + `next-intl`. Applied Tapbon design tokens
(ink/paper/mint/forest, 1rem radius, Schibsted Grotesk + JetBrains Mono) to the
Tailwind v4 theme and root layout. next-intl wired (da default, en; cookie-based,
no locale routing yet) with seed message files. Scaffolded
`.github/workflows/deploy.yml` for Azure App Service. Made /pricing dynamic so
builds don't call Stripe. `pnpm build` green.

## Next up
Verify first deploy at https://tapbon-app.azurewebsites.net, run Drizzle
migrations against pg-tapbon-prod (tapbon db), then Phase 1: spec + build the
public receipt page.

## Parked decisions
- MitID auth? Revisit at Phase 6.
- Key Vault kv-tapbon-prod: tenant policy forces publicNetworkAccess=Disabled —
  secrets couldn't be written from local CLI. Secrets live in App Service settings
  for now; revisit KV (private endpoint or policy exemption) later.
- Starter uses its own JWT auth (jose), not Auth.js — decide whether to swap to
  Auth.js magic-link now or when building merchant auth (Phase 0/1 boundary).
- Locale routing (/da, /en) vs cookie-only — decide when the public receipt page is built.
