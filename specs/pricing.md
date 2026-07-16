# Spec: Pricing-side (Phase 6, Stripe test-mode)

/pricing henter produkter/priser live fra Stripe (force-dynamic). To kort:
**Tapbon Basis** (199 kr/md) og **Tapbon Pro** (249 kr/md), begge 30 dages
gratis prøve. Beløb formateres med formatMoney (DKK, øre-integers fra Stripe).
Features: Basis = ubegrænsede kvitteringer, QR-stander, loyalitet+anmeldelser;
Pro = alt i Basis + printer-bridge (Tapbon-boksen) + prioriteret support.
Checkout via eksisterende checkoutAction (Stripe Checkout, subscription).
Alle strings via next-intl ("pricing" ns). Fallback hvis Stripe er nede: vis
kort uden knap. Out of scope: årlig fakturering, kuponer, moms-visning (Stripe
Tax senere).
