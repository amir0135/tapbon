"use client";
import { useState } from "react";

// Hidden admin: issue a receipt live during a pitch. No auth in the POC — never deploy as-is.
const emptyItem = { name: "", qty: 1, unitPrice: "", vatRate: 25 };

export default function Admin() {
  const [merchant, setMerchant] = useState({
    name: "Kaffe & Ko",
    cvr: "12345678",
    address: "Elmegade 5",
    city: "2200 København N",
    logoEmoji: "☕",
    reviewUrl: "https://g.page/r/demo/review",
  });
  const [items, setItems] = useState([
    { name: "Cappuccino", qty: 1, unitPrice: "42,00", vatRate: 25 },
    { name: "Kanelsnegl", qty: 1, unitPrice: "35,00", vatRate: 25 },
  ]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const setItem = (i, field, value) => {
    const next = items.slice();
    next[i] = { ...next[i], [field]: value };
    setItems(next);
  };

  const issue = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant, items }),
      });
      setResult(await res.json());
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container wide">
      <h1 style={{ margin: "1.5rem 0 1rem", fontSize: "1.4rem" }}>Tapbon admin — udsted bon</h1>

      <div className="card">
        <strong>Butik</strong>
        <label>Navn</label>
        <input value={merchant.name} onChange={(e) => setMerchant({ ...merchant, name: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <label>CVR</label>
            <input value={merchant.cvr} onChange={(e) => setMerchant({ ...merchant, cvr: e.target.value })} />
          </div>
          <div>
            <label>Logo (emoji)</label>
            <input value={merchant.logoEmoji} onChange={(e) => setMerchant({ ...merchant, logoEmoji: e.target.value })} />
          </div>
        </div>
        <label>Adresse</label>
        <input value={merchant.address} onChange={(e) => setMerchant({ ...merchant, address: e.target.value })} />
        <label>By</label>
        <input value={merchant.city} onChange={(e) => setMerchant({ ...merchant, city: e.target.value })} />
        <label>Google review-link</label>
        <input value={merchant.reviewUrl} onChange={(e) => setMerchant({ ...merchant, reviewUrl: e.target.value })} />
      </div>

      <div className="card">
        <strong>Varer</strong>
        <div className="item-row small muted" style={{ marginTop: "0.5rem" }}>
          <span>Vare</span>
          <span>Antal</span>
          <span>Pris (kr.)</span>
          <span>Moms %</span>
        </div>
        {items.map((it, i) => (
          <div className="item-row" key={i}>
            <input value={it.name} placeholder="Cappuccino" onChange={(e) => setItem(i, "name", e.target.value)} />
            <input type="number" min="1" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} />
            <input value={it.unitPrice} placeholder="42,00" onChange={(e) => setItem(i, "unitPrice", e.target.value)} />
            <select value={it.vatRate} onChange={(e) => setItem(i, "vatRate", e.target.value)}>
              <option value="25">25</option>
              <option value="0">0</option>
            </select>
          </div>
        ))}
        <button className="btn btn-ghost" style={{ marginTop: "0.5rem" }} onClick={() => setItems([...items, { ...emptyItem }])}>
          + Tilføj vare
        </button>
      </div>

      <button className="btn btn-primary" disabled={busy} onClick={issue}>
        {busy ? "Udsteder…" : "Udsted bon"}
      </button>

      {result?.id && (
        <div className="card" style={{ textAlign: "center" }}>
          <strong>Bon #{result.id} udstedt ✓</strong>
          <p className="small muted" style={{ margin: "0.4rem 0" }}>
            Scan med telefonen — QR peger på terminal-URL’en (/t/demo), som altid viser seneste bon.
            Det er samme URL, en NFC-tag skal indeholde.
          </p>
          <img src={result.qr} alt="QR" width="200" height="200" style={{ margin: "0.5rem auto" }} />
          <a className="btn btn-dark" href={result.receiptUrl} target="_blank" rel="noreferrer">
            Åbn bonen direkte
          </a>
        </div>
      )}
    </main>
  );
}
