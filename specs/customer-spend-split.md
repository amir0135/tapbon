# Spec: Privat/Erhverv-opdeling af boner (2026-07-23)

Privatpersoner vil kunne skille køb betalt med privat kort fra køb betalt
med firmakort (bruger-ønske under Loyverse-testen). Opdelingen er KUNDENS
klassificering — bonen selv er immutabel, så flaget bor på koblingen.

**Datamodel:** `customer_receipts.spend_type` varchar(10) NULL
(migration 0011): 'business' | null. Null = privat (default) — én simpel
toggle, ikke tre tilstande.

**API:** PATCH /api/archive { receiptId, business: boolean } (auth,
ejerskab via customerId+receiptId). Returnerer { spendType }.

**UI på /mine (ArchiveList):**
- Filter-piller over listen: Alle | Privat | Erhverv (client-side filter).
- Pr. bon-række: kuffert-chip — fremhævet (mint) når 'business'; tap
  toggler og PATCH'er optimistisk.
- Måneds-heroen følger det valgte filter.

**Regnskab-beskrivelse (samme slice):** Regnskab-sektionen i /mine/profil
får en klar hjælpetekst: hvor indbakke-adressen findes (Dinero: Indstillinger
→ Upload af bilag; e-conomic: Bilagshåndtering; Billy: Indstillinger), og at
hver NY gemt bon sendes automatisk dertil.

Out of scope: automatisk kort-detektion (kræver betalingsdata vi ikke har),
erhvervs-filter i forbrug/abonnementer (senere), eksport pr. kategori.
