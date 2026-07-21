# Spec: Kundeprofil (/mine/profil) — Receiptile-mønsteret

Mobile-first, én kolonne, samme kort-sprog som /mine (bg-canvas, rounded-2xl
paper-kort, mint-tint ikonfliser h-9 w-9 rounded-xl, mono uppercase sektions-
labels). Indgang: profil-ikon i /mine-headeren.

- **Konto-kort:** initial-avatar + navn/e-mail. Rækker: Navn og Telefon
  (redigérbare inline, server action `updateCustomerProfile`), E-mail read-only.
  Nye nullable kolonner `customers.name`/`customers.phone` (migration 0007).
- **Plan-kort:** "Gratis" — alle features inkluderet (kundekontoen er gratis).
- **Præferencer:** Sprog da/en (server action sætter 'locale'-cookien),
  Auto-gem kvitteringer (localStorage 'tapbon-autosave', default TIL —
  ArchiveSaver på /r respekterer flaget; ved fra vises "Gem"-knap i stedet).
- **Data & privatliv:** Kontakt support (mailto:hej@tapbon.dk),
  Privatlivspolitik → /privatliv, Vilkår → /vilkaar.
- **Om + handlinger:** Tapbon-navn + version; Log ud og Slet konto (rød,
  eksisterende actions). Uden kunde-session: vis login-pitch (genbrug
  SyncCard-mønsteret) i stedet for konto/plan; sprog + links virker stadig.
- Alle strings da/en i namespace `profile`.

## v2 (Receiptile-paritet, 2026-07-21)

- **Visning:** Privat/Forretning-segmented øverst. Forretning → `setPreferredMode('business')`
  + /dashboard (eller /sign-up uden merchant-konto).
- **Genveje:** Projekter, Dit forbrug, Abonnementer (kort-rækker, kun logget ind).
- **Sikkerhed:** valgfri adgangskode (`customers.password_hash`, migration 0009) —
  `setCustomerPassword` + `customerPasswordLogin` (enumeration-sikker); magic link forbliver default.
- **Regnskab:** e-conomic/Dinero/Billy indbakke-e-mails (`customers.accounting_forwards` jsonb).
  Ved NYT gem i /api/archive POST videresendes bonen via ACS (lib/email/forward-receipt.ts,
  blød fejl): fil-boner som vedhæftning, strukturerede som HTML m/ moms pr. sats + CVR.
- **Præferencer:** + Gem-bekræftelse ('tapbon-save-confirm') og Lydeffekt ('tapbon-save-sound'),
  begge default TIL — ArchiveSaver viser toast + WebAudio-printerklik.
- **Om:** version fra package.json.

Out of scope (parkeret i ROADMAP): Gmail-import, OAuth-regnskabsintegrationer, tema-valg.
