# Spec: Onboarding-wizard + setup-tjekliste (Receiptile-mønster)

Efter sign-up → `/onboarding` (mørkt kort som auth-siderne, progress-bar
"Trin X af 4", Spring over-knap der hopper til dashboard):
1. **Forretningstype** — Café/bageri, Restaurant, Butik, Frisør/klinik, Andet
2. **Kassesystem** — Zettle, OnlinePOS, Flatpay, Shopbox, Andet, Intet/ved ikke
   (data til Phase 5 POS-prioritering!)
3. **Boner pr. dag** — <25, 25–100, 100–300, 300+
4. **Forretningsinfo** — navn, CVR, valuta, review-URL (genbruger createMerchant,
   udvidet med profil-svar)
Svar gemmes i ny jsonb-kolonne `onboarding_profile` på merchants (ingen ny
tabel). Har brugeren allerede merchant → redirect til dashboard.

**Setup-tjekliste** på Oversigten (kort øverst, forsvinder når 100 %):
✓ Konto oprettet · ✓/○ Forretning oprettet · ✓/○ Bridge-nøgle genereret ·
✓/○ Første kvittering udstedt. Procent-bar som Receiptile.
Alle strings da/en. Out of scope: consumer-onboarding (Tapbon er merchant-first),
e-mail-verifikation, trin-analytics.
