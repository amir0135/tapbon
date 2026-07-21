# Spec: Kunde-indsigt (/mine/forbrug + /mine/abonnementer)

Mobile-first, samme kort-sprog som /mine/profil. Kræver kunde-session
(ellers login-prompt m/ link til profilen). Data = customer_receipts-join;
beløb i heltal-øre, kun kind='structured' tælles i summer (fil-boner = 0 kr.).

- **/mine/forbrug:** forest-hero "Denne måned" (total + antal boner, mono),
  6-måneders søjlediagram (ren CSS, tomme måneder udfyldes), "Pr. forretning"
  top-8-liste. Query `getCustomerSpending` (ISO-strenge + ::timestamp — Date-param-pitfall).
- **/mine/abonnementer:** forhandlere med 2+ gemte boner (`getRecurringMerchants`),
  antal + seneste dato + gns. beløb. Empty state à la Receiptile.
- Ingen nye tabeller. Strings da/en i namespaces `spending` / `subscriptions`.
