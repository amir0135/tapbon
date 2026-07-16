import type { Metadata } from 'next';
import { LegalShell, LegalSection, currentLocale } from '../legal-shell';

export const metadata: Metadata = { title: 'Privatlivspolitik — Tapbon' };

const CONTENT = {
  da: {
    title: 'Privatlivspolitik',
    updated: 'Senest opdateret 16. juli 2026',
    cross: 'Læs også vores vilkår',
    sections: [
      {
        h: '1. Hvem vi er',
        p: [
          'Tapbon leverer digitale kvitteringer til forretninger i Danmark og Skandinavien. Forretningen slår salget ind som normalt, og kunden henter sin kvittering ved at scanne en QR-kode eller tappe en NFC-brik — uden app, konto eller e-mail.',
          'Tapbon er dataansvarlig for de oplysninger, forretninger afgiver, når de opretter en konto. For selve kvitteringsdataene er forretningen dataansvarlig, og Tapbon er databehandler.',
        ],
      },
      {
        h: '2. Kunder ved kassen: vi gemmer ingen personoplysninger',
        p: [
          'Når du som kunde henter en kvittering hos en Tapbon-forretning, opretter du ikke en konto, afgiver ikke din e-mail og identificerer dig ikke på nogen måde. Kvitteringssiden indeholder ingen sporingsteknologier, ingen tredjeparts-cookies og ingen annoncenetværk.',
          'Loyalitetskort fungerer med et anonymt, tilfældigt token, der kun ligger på din egen telefon. Tokenet kan ikke kobles til din identitet.',
        ],
      },
      {
        h: '3. Oplysninger om forretninger (vores kunder)',
        p: [
          'Ved oprettelse af en forretningskonto behandler vi: navn, e-mailadresse og adgangskode (opbevaret som kryptografisk hash), forretningens navn, CVR-nummer, valuta samt eventuelt logo og link til Google-anmeldelser.',
          'Kvitteringsdata (varelinjer, beløb, moms samt eventuelle kvitteringsbilleder fra kassens printer) behandles på forretningens vegne og indeholder ikke oplysninger om kunderne.',
          'Betalingsoplysninger for abonnementet behandles af Stripe; Tapbon ser eller opbevarer aldrig kortnumre.',
        ],
      },
      {
        h: '4. Cookies',
        p: [
          'Vi bruger udelukkende teknisk nødvendige cookies: en sessions-cookie til login (kun for forretningskonti) og en cookie, der husker dit sprogvalg. Vi bruger ingen analyse-, marketing- eller tredjepartscookies, og derfor viser vi heller ikke et samtykkebanner.',
        ],
      },
      {
        h: '5. Hvor dine data ligger',
        p: [
          'Alle data opbevares og behandles i EU: hos Microsoft Azure i regionen Sverige Central. Data forlader ikke EU/EØS. Vores databehandlere er Microsoft (hosting) og Stripe (abonnementsbetaling).',
        ],
      },
      {
        h: '6. Hvor længe vi gemmer data',
        p: [
          'Kvitteringer er uforanderlige og opbevares, så længe forretningens konto består — kvitteringsdata kan være omfattet af bogføringslovens 5-årige opbevaringspligt, som påhviler forretningen.',
          'Sletter du din forretningskonto (Dashboard → Sikkerhed → Slet konto), deaktiveres kontoen straks, og din e-mailadresse anonymiseres. Ubetalte forpligtelser og lovpligtige opbevaringskrav kan medføre, at visse data opbevares i op til 5 år.',
        ],
      },
      {
        h: '7. Dine rettigheder',
        p: [
          'Du har ret til indsigt, berigtigelse, sletning, begrænsning af behandling og dataportabilitet efter databeskyttelsesforordningen (GDPR). Kontakt os, så svarer vi hurtigst muligt og senest inden for en måned.',
          'Du kan klage til Datatilsynet, Carl Jacobsens Vej 35, 2500 Valby, www.datatilsynet.dk.',
        ],
      },
      {
        h: '8. Kontakt',
        p: ['Spørgsmål om denne politik eller dine data: skriv til hej@tapbon.dk.'],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated 16 July 2026',
    cross: 'Also read our terms',
    sections: [
      {
        h: '1. Who we are',
        p: [
          'Tapbon provides digital receipts for businesses in Denmark and Scandinavia. The business rings up the sale as usual, and the customer collects their receipt by scanning a QR code or tapping an NFC tile — no app, account or email required.',
          'Tapbon is the data controller for the information businesses provide when creating an account. For the receipt data itself, the business is the controller and Tapbon is the processor.',
        ],
      },
      {
        h: '2. Shoppers at the counter: we store no personal data',
        p: [
          'When you collect a receipt at a Tapbon business, you do not create an account, provide an email, or identify yourself in any way. The receipt page contains no tracking technologies, no third-party cookies and no ad networks.',
          'Loyalty cards work with an anonymous random token stored only on your own phone. The token cannot be linked to your identity.',
        ],
      },
      {
        h: '3. Information about businesses (our customers)',
        p: [
          'When creating a business account we process: name, email address and password (stored as a cryptographic hash), business name, CVR number, currency, and optionally a logo and Google review link.',
          'Receipt data (line items, amounts, VAT, and any receipt images from the register printer) is processed on behalf of the business and contains no information about shoppers.',
          'Subscription payment details are handled by Stripe; Tapbon never sees or stores card numbers.',
        ],
      },
      {
        h: '4. Cookies',
        p: [
          'We only use strictly necessary cookies: a session cookie for login (business accounts only) and a cookie remembering your language. We use no analytics, marketing or third-party cookies — which is why we show no consent banner.',
        ],
      },
      {
        h: '5. Where your data lives',
        p: [
          'All data is stored and processed within the EU: on Microsoft Azure in the Sweden Central region. Data never leaves the EU/EEA. Our processors are Microsoft (hosting) and Stripe (subscription billing).',
        ],
      },
      {
        h: '6. Retention',
        p: [
          'Receipts are immutable and retained for as long as the business account exists — receipt data may be subject to the Danish Bookkeeping Act’s 5-year retention duty, which rests with the business.',
          'If you delete your business account (Dashboard → Security → Delete account), the account is deactivated immediately and your email anonymised. Statutory retention duties may require certain data to be kept for up to 5 years.',
        ],
      },
      {
        h: '7. Your rights',
        p: [
          'You have the right to access, rectification, erasure, restriction and data portability under the GDPR. Contact us and we will respond as soon as possible and within one month.',
          'You may complain to the Danish Data Protection Agency (Datatilsynet), www.datatilsynet.dk.',
        ],
      },
      {
        h: '8. Contact',
        p: ['Questions about this policy or your data: write to hej@tapbon.dk.'],
      },
    ],
  },
} as const;

export default async function PrivacyPage() {
  const locale = await currentLocale();
  const c = CONTENT[locale];
  return (
    <LegalShell
      title={c.title}
      updated={c.updated}
      crossLink={{ href: '/vilkaar', label: c.cross }}
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
