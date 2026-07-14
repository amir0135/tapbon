"use client";
import { useEffect, useState } from "react";

// POC loyalty: stamp count in localStorage per merchant. Real build: server-side per customer.
export default function LoyaltyCard({ merchantName }) {
  const [stamps, setStamps] = useState(null);
  const goal = 10;

  useEffect(() => {
    const key = `tapbon-stamps-${merchantName}`;
    const current = Math.min(goal, (parseInt(localStorage.getItem(key) ?? "0", 10) || 0) + 1);
    localStorage.setItem(key, String(current));
    setStamps(current);
  }, [merchantName]);

  if (stamps === null) return null;

  return (
    <div className="card">
      <strong>Dit stempelkort</strong>
      <p className="small muted">
        {stamps >= goal ? "Fuldt kort — næste kaffe er gratis! 🎉" : `${goal - stamps} stempler til en gratis kaffe`}
      </p>
      <div className="stamps">
        {Array.from({ length: goal }).map((_, i) => (
          <div key={i} className={`stamp ${i < stamps ? "filled" : ""}`}>
            {i < stamps ? "✓" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
