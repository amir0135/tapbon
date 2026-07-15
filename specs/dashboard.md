# Spec: Merchant-dashboard v1 (Phase 3 — "proper MVP")

`/dashboard` = **Oversigt** (server component, erstatter starterens Team-side):
øverst 3 nøgletals-kort — kvitteringer i dag, omsætning i dag, kvitteringer
sidste 7 dage (omsætning = kun structured; fil-boner tæller i antal). Dernæst
**terminal-kort**: navn, Bridge-status (grøn "online" hvis lastSeenAt < 3 min,
ellers grå "offline"/"aldrig forbundet"), tap-URL. Dernæst **seneste 5
kvitteringer** (nr., tid, beløb, status-badge pending/claimed/expired, link) og
genveje: "Udsted kvittering" → /dashboard/receipts, "Print stander".
Sidebar: Oversigt, Kvitteringer, Indstillinger (=general), Sikkerhed — Team- og
Activity-links fjernes (ruter består). Alle nye strings via next-intl ("dash"
ns, da/en); dashboard forbliver bevidst kedeligt shadcn (husregel).
Out of scope: multi-terminal, grafer, CSV-eksport, oversættelse af
general/security-sidernes indre (parkeres).
