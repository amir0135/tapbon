import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/landing/site-header';
import { SiteFooter, type FooterStrings } from '@/components/landing/site-footer';
import { ScrollyHero, type HeroPanel, type HeroStrings } from '@/components/landing/scrolly-hero';
import { CompareSection, type CompareStrings } from '@/components/landing/compare-section';
import { OrderSection, type OrderStrings } from '@/components/landing/order-section';
import { BusinessSection, type BusinessStrings } from '@/components/landing/business-section';
import { MissionSection, type MissionStrings } from '@/components/landing/mission-section';
import { FaqSection, type FaqStrings } from '@/components/landing/faq-section';
import { MobileCta } from '@/components/landing/mobile-cta';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  const hero: HeroStrings = {
    h1a: t('heroA'),
    h1b: t('heroB'),
    sub: t('heroSub'),
    bullets: [t('heroBul1'), t('heroBul2'), t('heroBul3'), t('heroBul4')],
    ctaGetStarted: t('ctaGetStarted'),
    ctaStartNow: t('ctaStartNow'),
    tileTitle: 'Kvittering?',
    tileSub: 'Scan her'
  };

  const panels: HeroPanel[] = (
    [
      ['how', 'tap'],
      ['how', 'pdf'],
      ['forBusiness', 'review'],
      ['forBusiness', 'loyalty'],
      ['forBusiness', 'vat'],
      ['forBusiness', 'brand']
    ] as const
  ).map(([kickerKey, key]) => ({
    kicker: t(kickerKey),
    title: t(`${key}Title`),
    points: [t(`${key}1`), t(`${key}2`), t(`${key}3`)],
    screen: key
  }));

  const compare: CompareStrings = {
    oldWay: t('oldWay'),
    oldWayBody: t('oldWayBody'),
    oldUpfront: t('oldUpfront'),
    oldUpfrontVal: t('oldUpfrontVal'),
    oldOngoing: t('oldOngoing'),
    oldOngoingVal: t('oldOngoingVal'),
    oldChipPrinter: t('oldChipPrinter'),
    oldChipStamp: t('oldChipStamp'),
    oldChipSign: t('oldChipSign'),
    newWay: t('newWay'),
    newWayBody: t('newWayBody'),
    newDevice: t('newDevice'),
    newDeviceVal: t('newDeviceVal'),
    newMonthly: t('newMonthly'),
    newMonthlyVal: t('newMonthlyVal'),
    newChipTile: t('newChipTile'),
    ctaPaperless: t('ctaPaperless'),
    ctaGetStarted: t('ctaGetStarted'),
    vsBadge: t('vsBadge')
  };

  const order: OrderStrings = {
    badge: t('orderBadge'),
    title: t('orderTitle'),
    body1: t('orderBody1'),
    body2: t('orderBody2'),
    tabAria: t('tabAria'),
    tabMonthly: t('tabMonthly'),
    tabAnnual: t('tabAnnual'),
    tabBest: t('tabBest'),
    deviceLabel: t('priceDeviceLabel'),
    deviceValMonthly: t('priceDeviceValMonthly'),
    deviceValAnnual: t('priceDeviceValAnnual'),
    deviceNoteMonthly: t('priceDeviceNoteMonthly'),
    deviceNoteAnnual: t('priceDeviceNoteAnnual'),
    ongoingLabel: t('priceOngoingLabel'),
    ongoingValMonthly: t('priceOngoingValMonthly'),
    ongoingValAnnual: t('priceOngoingValAnnual'),
    ongoingUnitMonthly: t('priceOngoingUnitMonthly'),
    ongoingUnitAnnual: t('priceOngoingUnitAnnual'),
    ongoingNoteMonthly: t('priceOngoingNoteMonthly'),
    ongoingNoteAnnual: t('priceOngoingNoteAnnual'),
    startNote: t('priceStartNote'),
    productName: t('productName'),
    inStock: t('inStock'),
    chooseColour: t('chooseColour'),
    colourLight: t('colourLight'),
    colourDark: t('colourDark'),
    required: t('formRequired'),
    formBusiness: t('formBusiness'),
    formBusinessPh: t('formBusinessPh'),
    formEmail: t('formEmail'),
    formEmailPh: t('formEmailPh'),
    formPos: t('formPos'),
    formPosPh: t('formPosPh'),
    formPosOther: t('formPosOther'),
    formTiles: t('formTiles'),
    checkout: t('checkout'),
    expandCta: t('ctaGetStarted'),
    cancelAnytime: t('cancelAnytime'),
    posRow: t('posRow'),
    tileTitle: hero.tileTitle,
    tileSub: hero.tileSub
  };

  const businesses: BusinessStrings = {
    kicker: t('businessesKicker'),
    title: t('businessesTitle'),
    sub: t('businessesSub'),
    cta: t('ctaOrderToday'),
    guarantee: t('guarantee'),
    items: [1, 2, 3, 4, 5, 6].map((i) => ({
      title: t(`biz${i}`),
      body: t(`biz${i}Body`)
    }))
  };

  const mission: MissionStrings = {
    kicker: t('missionKicker'),
    strong: t('missionStrong'),
    rest: t('missionRest'),
    paragraphs: [t('missionP1'), t('missionP2'), t('missionP3'), t('missionP4')],
    bold: t('missionBold'),
    cta: t('missionCta'),
    factsHeader: t('missionFactsHeader'),
    facts: [
      { value: t('missionFact1V'), label: t('missionFact1L') },
      { value: t('missionFact2V'), label: t('missionFact2L') },
      { value: t('missionFact3V'), label: t('missionFact3L') },
      { value: t('missionFact4V'), label: t('missionFact4L') }
    ]
  };

  const faq: FaqStrings = {
    kicker: t('faqKicker'),
    title: t('faqTitle'),
    items: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
      q: t(`faq${i}Q`),
      a: t(`faq${i}A`)
    }))
  };

  const footer: FooterStrings = {
    tagline: t('footerTagline'),
    company: [t('footerCompany1'), t('footerCompany2'), t('footerCompany3')],
    columns: [
      {
        heading: t('footerProduct'),
        links: [
          { label: t('footerGetTile'), href: '#kom-i-gang' },
          { label: t('footerFaq'), href: '#faq' }
        ]
      },
      {
        heading: t('footerAccount'),
        links: [
          { label: t('footerSignup'), href: '/sign-up' },
          { label: t('footerLogin'), href: '/sign-in' }
        ]
      },
      {
        heading: t('footerLegal'),
        links: [
          { label: t('footerPrivacy'), href: '/privatliv' },
          { label: t('footerTerms'), href: '/vilkaar' },
          { label: t('footerRefund'), href: '/vilkaar' }
        ]
      },
      {
        heading: t('footerContact'),
        links: [
          { label: t('footerContactUs'), href: `mailto:${t('footerEmail')}` },
          { label: t('footerEmail'), href: `mailto:${t('footerEmail')}` }
        ]
      }
    ],
    disclaimer: t('footerDisclaimer'),
    copyright: t('footerCopyright'),
    owned: t('footerOwned')
  };

  return (
    <div className="bg-canvas">
      <div className="page-zoom-viewport">
        <div className="page-zoom">
          <SiteHeader signup={t('navSignup')} order={t('navOrder')} />
          <main className="pt-[92px] md:pt-0">
            <ScrollyHero strings={hero} panels={panels} />
            <CompareSection s={compare} />
            <OrderSection s={order} />
            <BusinessSection s={businesses} />
            <MissionSection s={mission} />
            <FaqSection s={faq} />
          </main>
          <SiteFooter s={footer} />
        </div>
      </div>
      {/* fixed element must live outside the container-type wrapper
          (layout containment would anchor it to the page, not the window) */}
      <MobileCta label={t('ctaGetStarted')} />
    </div>
  );
}
