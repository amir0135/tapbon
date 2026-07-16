# Spec: Legal-sider + GDPR (pilot-blokkere)

`/privatliv` og `/vilkaar`: offentlige, lyse indholdssider (max-w-prose, ren
typografi, lille top-nav med Tapbon-logo → /, footer-link til hinanden).
Indhold som locale-vekslede content-blokke i komponenten (da primær, en
sekundær) — juridiske dokumenter egner sig ikke til messages-json; locale
hentes via next-intl getLocale, så hard rule 4 overholdes i ånden.

**Privatliv (sandfærdig ift. implementeringen):** Tapbon = dataansvarlig for
merchant-konti, databehandler for kvitteringsdata. Kunder/shoppere: INGEN
personoplysninger (intet login/e-mail/tracking; loyalitet = anonymt token).
Cookies: kun session + sprog. Hosting: Azure EU (Sverige). Betaling: Stripe.
Opbevaring: kvitteringer jf. bogføringsloven (5 år); kontosletning via
Sikkerhed-siden. Rettigheder + Datatilsynet.

**Vilkår:** abonnement (Basis/Pro, 30 dages prøve, ingen binding, opsigelse
via kundeportal), kvitteringens juridiske status (forretningen er udsteder og
ansvarlig for indholdet; Tapbon er distributionskanal), drift/ansvar, dansk ret.

**Links:** footer-Jura-kolonnen (/privatliv, /vilkaar; refusion → vilkår-afsnit),
auth-sidernes "Ved at fortsætte accepterer du …", kvitteringssidens footer
(privatliv). GDPR-sletteflow: findes allerede (Sikkerhed → Slet konto);
politikken dokumenterer det. NB: tekster er skabeloner — juridisk gennemsyn
før betalende kunder.
