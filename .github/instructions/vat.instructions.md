---
applyTo: "**/lib/vat/**,**/receipts/**"
---

# VAT / moms rules

- Standard rate 25% in DK/SE/NO, but rates are per line item (`vat_rate` on `receipt_items`) — never assume one rate per receipt.
- Receipts store a per-rate VAT breakdown (jsonb): for each rate, the VAT amount and the base amount.
- All amounts are integer øre/öre/cents. VAT rounding happens once, per rate, at receipt issue time — not per line display.
- Receipt pages must show: VAT per rate, total incl. VAT, and the seller's CVR-nummer (DK) / organisationsnummer (SE/NO).
- Danish labels: "Moms" (VAT), "Heraf moms 25%" (of which VAT). Always via next-intl keys.
