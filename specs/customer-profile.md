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

Out of scope (parkeret i ROADMAP): Gmail-import, regnskabs-integrationer
(e-conomic/Dinero/Billy — dansk marked, ikke Xero/Hubdoc), tema-valg, Projects.
