import { getReceipt } from "../../../lib/store";
import { formatOre } from "../../../lib/receipt";
import LoyaltyCard from "./loyalty";
import Actions from "./actions";

export default async function ReceiptPage({ params }) {
  const { id } = await params;
  const r = getReceipt(id);

  if (!r) {
    return (
      <main className="container">
        <div className="card" style={{ marginTop: "2rem" }}>
          Bonen findes ikke (POC-data nulstilles ved genstart).
        </div>
      </main>
    );
  }

  const d = new Date(r.issuedAt);
  const dateStr = d.toLocaleDateString("da-DK", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="container">
      <p className="small muted no-print" style={{ margin: "1rem 0 0.5rem", textAlign: "center" }}>
        <span className="live-dot" />
        Din digitale bon · Tapbon
      </p>

      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
          <div style={{ fontSize: "2.4rem" }}>{r.merchant.logoEmoji}</div>
          <strong style={{ fontSize: "1.15rem" }}>{r.merchant.name}</strong>
          <p className="small muted">
            {r.merchant.address} · {r.merchant.city}
          </p>
          <p className="small muted">CVR: {r.merchant.cvr}</p>
        </div>

        <div className="receipt-body">
          <div className="receipt-line muted">
            <span>{dateStr} {timeStr}</span>
            <span>Bon #{r.id}</span>
          </div>
          <hr className="receipt-rule" />
          {r.lines.map((l, i) => (
            <div className="receipt-line" key={i}>
              <span>
                {l.qty} × {l.name}
              </span>
              <span>{formatOre(l.totalOre)}</span>
            </div>
          ))}
          <hr className="receipt-rule" />
          <div className="receipt-total">
            <span>Total</span>
            <span>{formatOre(r.totalOre)}</span>
          </div>
          {Object.entries(r.vatBreakdown).map(([rate, vat]) => (
            <div className="receipt-line muted small" key={rate}>
              <span>Heraf moms ({rate}%)</span>
              <span>{formatOre(vat)}</span>
            </div>
          ))}
          <hr className="receipt-rule" />
          <p className="small muted" style={{ wordBreak: "break-all" }}>
            Digitalt signeret · {r.hash.slice(0, 24)}…
          </p>
        </div>
      </div>

      <LoyaltyCard merchantName={r.merchant.name} />
      <Actions reviewUrl={r.merchant.reviewUrl} />

      <p className="small muted no-print" style={{ textAlign: "center", margin: "1.2rem 0" }}>
        Ingen papir. Ingen app. Data i EU. · tapbon.dk
      </p>
    </main>
  );
}
