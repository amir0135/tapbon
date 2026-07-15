import { getReceipt } from "../../../lib/store";
import { renderReceiptSvg } from "../../../lib/render";
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

  const receiptSvg = renderReceiptSvg(r);

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
          <div
            className="receipt-svg"
            dangerouslySetInnerHTML={{ __html: receiptSvg }}
          />
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
