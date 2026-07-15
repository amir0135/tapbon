# Spec: Auth-sider (sign-in / sign-up) — Receiptile-stil

Reference: app.receiptile.com/sign-in (screenshots 2026-07-15).
Mørk side (bg-ink-deep), centreret kort (bg-ink-raised, rounded-3xl, hvid 10%-ring).
I kortet, centreret: Tapbon-wordmark (grotesk, paper) → kicker i mono uppercase
(mutedOnDark, tracking-widest): "LOG IND"/"OPRET KONTO" → H1 "Velkommen tilbage"/
"Opret din konto" → grå undertekst. Felter: uppercase mono-labels (små, mutedOnDark),
høje inputs (rounded-2xl, mørk flade, hvid 12%-kant, mint fokus-ring), password har
vis/skjul-øje. Primær knap: fuld bredde pill, bg-forest → hover lysere, hvid tekst.
Divider "eller" + link-skift mellem sign-in/sign-up i mint. Ingen sociale knapper
(ingen OAuth endnu — ingen døde knapper). Alle strings via next-intl ("auth" ns).
Mobile-first én kolonne; kortet fylder skærmen på små devices (ingen ring/radius).
