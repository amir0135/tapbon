# Landing page — section-by-section plan (receipt-tile reference, Tapbon brand)

Reference measured at 1440/1024/390. Full-viewport panels, DM-Sans-like tight
headings → Schibsted Grotesk; green accents → mint `#34C97B`; near-black bands
→ `ink-deep #10151D`. Tokens: `lib/design/tokens.ts`. Route: `app/(marketing)/page.tsx`.

## 1. Header (`site-header.tsx`)
Absolute, transparent, floats over hero. 92px tall, gutter px-6/lg:px-[86px].
Left: geometric logo mark + wordmark. Right: "Log ind" text link + ink pill
"Bestil nu" (h-12, px-[22px], radius-full) → `#kom-i-gang`.

## 2. Scrollytelling hero (`scrolly-hero.tsx`, client, motion)
Container ~`(panels+2) * 100vh`; inner `sticky top-0 h-screen` 3-column grid
(text rail 346px / device center / CTA rail). Progress via `useScroll`.
- Intro state: H1 46px left + sub; center tile mock (square, "Kvittering?"
  face, mint pulse dot, reflection); right 4 benefit bullets + outline pill.
- Scroll: phone mock rises over tile; left rail swaps 6 panels (mono mint
  kicker / H2 42px / 3 bullets); phone screen content advances per panel;
  right rail shows outline "Start nu →" pill.
- Mobile (<lg): no pinning — phone above, panels stacked below, sticky
  bottom CTA bar.

## 3. Compare band (`compare-section.tsx`) — dark `ink-deep`, min-h-screen
Two halves + white "VS" circle on the center divider (dashed).
Each half: H2 40px white, muted sub, 16:10 rounded-[20px] geometric counter
scene with floating price chips, then stat card (icon ✗ red / ✓ mint,
two price columns) + outline-white pill CTA.

## 4. Order band (`order-section.tsx`, client) — dark, min-h-screen
Left: mint-outline badge pill "GRATIS PILOTPERIODE", H2 "Kom i gang med
Tapbon.", two paras, Månedlig/Årlig tablist (dark bordered pill container,
active tab = white pill), price grid (Brik / Løbende, mint figures).
Right: raised card `ink-raised` radius-20: product image area (light square,
tile mock), name + "På lager" mint dot, colour radios (Hvid/Sort, bordered
pills, mint ring on checked), mint pill CTA, then form: Forretningsnavn*,
E-mail*, Kassesystem* (select), Antal brikker (select), disabled "Til kassen"
until valid, "Opsig når som helst." Below band: "Fungerer sammen med dit
kassesystem" + 6 grayscale wordmarks.

## 5. Business grid (`business-section.tsx`) — light canvas, min-h-screen
Left rail: kicker, H2 43px, sub, ink pill CTA "Bestil din i dag →",
✓ guarantee line. Right: 6 stacked white cards (radius-16, icon in 44px
mint-tint rounded-xl, H3 18px + muted body), staggered reveal.

## 6. Mission (`mission-section.tsx`) — light
Left: kicker VORES MISSION, H2 "**300 milliarder** er hvorfor.", 4 paras +
bold closer, outline pill CTA. Right: CSS globe (radial-gradient sphere,
rotating longitude bands, slow spin, paused on reduced motion).

## 7. FAQ (`faq-section.tsx`, client) — light
Kicker FAQ + H2 43px, then 8 rows: full-width button rows (18px semibold,
chevron rotates 180°), hairline top/bottom borders, motion height expand.
`aria-expanded` + `aria-controls`, keyboard operable.

## 8. Footer (`site-footer.tsx`) — dark `ink-deep`
Logo + tagline + company lines left; 4 columns (PRODUKT/KONTO/JURA/KONTAKT,
13px mono uppercase headers); disclaimer para; hairline; © row.

## Shared
`pill-link.tsx` (solid-ink | solid-mint | outline-ink | outline-paper,
optional arrow), `kicker.tsx`, `fade-in.tsx` (motion whileInView, 28px rise),
`mocks.tsx` (TileMock, PhoneMock + screens, counter scenes — all geometric
CSS, no photos). All copy via next-intl `landing.*` (da primary + en).
