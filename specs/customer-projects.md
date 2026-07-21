# Spec: Projekter (/mine/projekter) — gruppér boner

Gruppér gemte boner pr. job, kunde eller momsperiode (Receiptiles "Projects",
DK-vinkel). Kræver kunde-session.

- Ny tabel `customer_projects` (id, customer_id, name ≤80) + nullable
  `customer_receipts.project_id` (migration 0009). Boner slettes ALDRIG via
  projekter — slet projekt nulstiller kun project_id (immutabilitet).
- **Liste:** opret-formular (navn + Opret-pille), projekt-kort m/ bon-antal,
  empty state. **Detalje:** boner i projektet (Fjern) + kontoens øvrige boner
  (Tilføj), total for strukturerede boner, Slet projekt (confirm).
- Actions: `createProject`, `deleteProject`, `assignReceiptToProject`
  (ejerskabs-tjek på customer_id). Strings da/en i namespace `projects`.
