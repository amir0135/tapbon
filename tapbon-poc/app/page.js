import Link from "next/link";

export default function Landing() {
  return (
    <main className="container">
      <p style={{ margin: "2.2rem 0 0.8rem", fontWeight: 700 }}>
        <span className="live-dot" /> Tapbon
      </p>
      <h1 className="hero">
        Papirbonens afløser.
        <br />
        <span className="accent">Tap. Bon. Færdig.</span>
      </h1>
      <p style={{ margin: "1rem 0 1.5rem" }} className="muted">
        Din kunde tapper sin telefon og får bonen med det samme — sammen med dit
        loyalitetskort og ét tryk til en Google-anmeldelse. Ingen app. Ingen
        integration. Klar til digital bogføring.
      </p>

      <div className="card">
        <strong>Pilotpris: 199 kr./md.</strong>
        <p className="muted small" style={{ margin: "0.3rem 0 0.9rem" }}>
          Første måned gratis. Vi sætter alt op for dig — det tager ti minutter.
        </p>
        <a className="btn btn-primary" href="mailto:hello@tapbon.dk?subject=Pilot">
          Bliv pilotbutik
        </a>
      </div>

      <div className="card">
        <strong>Prøv demoen</strong>
        <p className="muted small" style={{ margin: "0.3rem 0 0.9rem" }}>
          Udsted en bon i admin, og scan QR-koden med din telefon.
        </p>
        <Link className="btn btn-dark" href="/admin">
          Åbn admin (udsted bon)
        </Link>
      </div>

      <p className="small muted" style={{ margin: "1.4rem 0" }}>
        Mindre papir · Flere anmeldelser · Bogføringsklar · Data i EU
      </p>
    </main>
  );
}
