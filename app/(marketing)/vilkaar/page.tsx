import type { Metadata } from 'next';
import { LegalShell, LegalSection, currentLocale } from '../legal-shell';

export const metadata: Metadata = { title: 'Vilkår — Tapbon' };

const CONTENT = {
  da: {
    title: 'Vilkår og betingelser',
    updated: 'Senest opdateret 16. juli 2026',
    cross: 'Læs også vores privatlivspolitik',
    sections: [
      {
        h: '1. Aftalen',
        p: [
          'Disse vilkår gælder mellem Tapbon og den forretning ("kunden"), der opretter en konto og anvender tjenesten. Ved at oprette en konto accepterer du vilkårene.',
        ],
      },
      {
        h: '2. Tjenesten',
        p: [
          'Tapbon leverer digitale kvitteringer: udstedelse fra dashboardet eller automatisk opsamling fra kassens printer-flow (Tapbon Bridge), kvitteringsside til kunden via QR/NFC, loyalitetskort og anmeldelses-link samt et dashboard med overblik.',
          'Kvitteringen udstedes af forretningen. Forretningen er ansvarlig for kvitteringens indhold, herunder korrekt moms og CVR-oplysninger. Tapbon er distributionskanal og gemmer kvitteringen uforanderligt med kryptografisk forsegling.',
        ],
      },
      {
        h: '3. Abonnement, prøveperiode og betaling',
        p: [
          'Tapbon Basis koster 199 kr./md. og Tapbon Pro 249 kr./md., begge ekskl. moms og med 30 dages gratis prøveperiode. Betaling sker månedligt forud via Stripe.',
          'Der er ingen binding. Abonnementet kan opsiges når som helst via kundeportalen (Dashboard → Indstillinger → Administrér abonnement) med virkning fra udgangen af den betalte periode.',
        ],
      },
      {
        h: '4. Refusion',
        p: [
          'Allerede betalte abonnementsperioder refunderes ikke, medmindre andet følger af ufravigelig lovgivning. Opsiger du i prøveperioden, trækkes intet beløb.',
        ],
      },
      {
        h: '5. Kundens forpligtelser',
        p: [
          'Kunden skal afgive korrekte oplysninger (herunder CVR), holde adgangskoder og Bridge-nøgler fortrolige og må ikke anvende tjenesten til ulovlige formål eller udstede vildledende kvitteringer.',
        ],
      },
      {
        h: '6. Drift og ansvar',
        p: [
          'Tjenesten leveres, som den er og forefindes. Vi tilstræber høj oppetid, men garanterer den ikke. Tapbon er ikke ansvarlig for indirekte tab, driftstab eller tab af data ud over, hvad der følger af ufravigelig lovgivning. Tapbons samlede ansvar er begrænset til de seneste 12 måneders betalt abonnement.',
          'Kvitteringsdata kan være omfattet af bogføringslovens opbevaringspligt; ansvaret for at opfylde denne påhviler forretningen. Tapbon anbefaler, at forretningen også opbevarer sit eget kassesystems data.',
        ],
      },
      {
        h: '7. Ophør',
        p: [
          'Ved kontosletning deaktiveres adgangen straks. Tapbon kan opsige eller suspendere en konto ved væsentlig misligholdelse. Data håndteres efter privatlivspolitikkens afsnit om opbevaring.',
        ],
      },
      {
        h: '8. Ændringer, lovvalg og værneting',
        p: [
          'Vi kan opdatere vilkårene med 30 dages varsel pr. e-mail. Aftalen er underlagt dansk ret, og tvister afgøres ved danske domstole.',
          'Spørgsmål: hej@tapbon.dk.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms and Conditions',
    updated: 'Last updated 16 July 2026',
    cross: 'Also read our privacy policy',
    sections: [
      {
        h: '1. The agreement',
        p: [
          'These terms apply between Tapbon and the business ("the customer") that creates an account and uses the service. By creating an account you accept the terms.',
        ],
      },
      {
        h: '2. The service',
        p: [
          'Tapbon provides digital receipts: issuing from the dashboard or automatic capture from the register\u2019s print flow (Tapbon Bridge), a customer-facing receipt page via QR/NFC, loyalty cards and review links, plus a dashboard.',
          'The receipt is issued by the business. The business is responsible for its content, including correct VAT and CVR details. Tapbon is the distribution channel and stores the receipt immutably with a cryptographic seal.',
        ],
      },
      {
        h: '3. Subscription, trial and payment',
        p: [
          'Tapbon Basis costs DKK 199/month and Tapbon Pro DKK 249/month, both excl. VAT and with a 30-day free trial. Billing is monthly in advance via Stripe.',
          'There is no lock-in. The subscription can be cancelled at any time via the customer portal (Dashboard → Settings → Manage subscription), effective at the end of the paid period.',
        ],
      },
      {
        h: '4. Refunds',
        p: [
          'Paid subscription periods are not refunded unless required by mandatory law. If you cancel during the trial, nothing is charged.',
        ],
      },
      {
        h: '5. Customer obligations',
        p: [
          'The customer must provide accurate information (including CVR), keep passwords and Bridge keys confidential, and must not use the service for unlawful purposes or issue misleading receipts.',
        ],
      },
      {
        h: '6. Operation and liability',
        p: [
          'The service is provided as-is. We aim for high uptime but do not guarantee it. Tapbon is not liable for indirect or consequential loss beyond what follows from mandatory law. Tapbon\u2019s total liability is capped at the last 12 months of paid subscription.',
          'Receipt data may be subject to statutory bookkeeping retention duties; complying with these rests with the business. We recommend the business also retains its own POS data.',
        ],
      },
      {
        h: '7. Termination',
        p: [
          'On account deletion, access is deactivated immediately. Tapbon may terminate or suspend an account on material breach. Data is handled per the retention section of the privacy policy.',
        ],
      },
      {
        h: '8. Changes, governing law and venue',
        p: [
          'We may update these terms with 30 days\u2019 notice by email. The agreement is governed by Danish law and disputes are settled by Danish courts.',
          'Questions: hej@tapbon.dk.',
        ],
      },
    ],
  },
} as const;

export default async function TermsPage() {
  const locale = await currentLocale();
  const c = CONTENT[locale];
  return (
    <LegalShell
      title={c.title}
      updated={c.updated}
      crossLink={{ href: '/privatliv', label: c.cross }}
    >
      {c.sections.map((s) => (
        <LegalSection key={s.h} heading={s.h}>
          {s.p.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
        </LegalSection>
      ))}
    </LegalShell>
  );
}
