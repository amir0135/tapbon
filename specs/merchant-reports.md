# Spec: Rapporter (merchant sales overview, 2026-07-23)

Merchant-backend slice 2 (efter Enheder): en "Rapporter"-side i dashboardet —
pendant til kundens /mine/forbrug, men for butikkens salg.

**Side:** /dashboard/reports (sidebar-item "Rapporter", BarChart3-ikon).
Server component: getUser → merchant → getSalesReport(merchantId) → ren
server-renderet side (ingen client-komponent nødvendig — ingen interaktion).

**Indhold (denne måned + sidste 30 dage):**
1. Hero-kort: omsætning + antal boner denne måned (structured; fil-boner
   tælles i antal men ikke i beløb — totalGross er 0).
2. Pr. dag, sidste 14 dage: rene CSS-søjler (samme mønster som kundens
   forbrugsside), tomme dage udfyldes med 0.
3. Top 8 varer (receipt_items sidste 30 dage): navn, antal (sum qty),
   omsætning (sum line_total_gross).
4. Moms pr. sats denne måned (vat_breakdown jsonb summeres pr. rate i SQL
   via jsonb_array_elements) — heltal-øre, allerede afrundet ved udstedelse
   (VAT-reglerne: rund én gang pr. sats ved issue; her summeres kun).
   Label via i18n ("Heraf moms {rate} %").

**Query:** getSalesReport i lib/receipts/queries.ts — monthTotal/monthCount,
days[14] {date,total,count}, topItems[8] {name,qty,total}, vatByRate
{rate,vat,gross}. Alle beløb heltal-øre; valuta = merchant.currency.

**i18n:** ns 'reports' (da/en) + dash.navReports.
Out of scope: datovælger/perioder, CSV-eksport, sammenligning m/ sidste
periode, pr.-terminal-filter.
