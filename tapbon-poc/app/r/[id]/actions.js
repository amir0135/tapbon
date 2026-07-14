"use client";

export default function Actions({ reviewUrl }) {
  return (
    <div className="card no-print">
      <a className="btn btn-primary" href={reviewUrl} target="_blank" rel="noreferrer">
        ⭐ Giv os en anmeldelse på Google
      </a>
      <button className="btn btn-ghost" onClick={() => window.print()}>
        ⬇︎ Gem som PDF
      </button>
    </div>
  );
}
