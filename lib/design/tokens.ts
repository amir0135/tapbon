/**
 * Tapbon design tokens — single source of truth for the marketing site.
 *
 * Scale and rhythm are calibrated against a receipt-tile landing page
 * reference measured at 1440 px (typography, spacing, radii, control
 * proportions). Colors and fonts are Tapbon brand (see DECISIONS.md rule 6)
 * and are wired into Tailwind via `@theme` in app/globals.css.
 */

export const color = {
  /** Body text / solid dark controls */
  ink: '#232B38',
  /** Near-black band background (compare / order / footer sections) */
  inkDeep: '#10151D',
  /** Elevated card surface on inkDeep */
  inkRaised: '#1A202B',
  /** Page background (off-white canvas) */
  canvas: '#F8FAFB',
  /** Card / receipt surface */
  paper: '#FFFFFF',
  /** Brand accent (CTAs, kickers, highlights) */
  mint: '#34C97B',
  /** Soft mint tint for icon tiles on paper */
  mintTint: '#E5F8EE',
  /** Deep support green (mission band, illustrations) */
  forest: '#3E624C',
  /** Muted body copy on light */
  muted: '#6B7280',
  /** Muted body copy on dark */
  mutedOnDark: '#9CA3AF',
  /** Hairline borders on light */
  border: '#E5E7EB',
  /** Hairline borders on dark */
  borderOnDark: 'rgba(255,255,255,0.12)',
  /** Negative price accent (old-way card) */
  negative: '#F87171'
} as const;

/** Type scale. Desktop / mobile px, with line-height and tracking. */
export const type = {
  display: { size: 46, sizeSm: 38, lh: 1.06, ls: '-0.022em', weight: 600 },
  h2: { size: 42, sizeSm: 30, lh: 1.05, ls: '-0.022em', weight: 600 },
  h3: { size: 18, sizeSm: 17, lh: 1.3, ls: '0em', weight: 600 },
  body: { size: 17, sizeSm: 16, lh: 1.55, ls: '0.01em', weight: 400 },
  small: { size: 14.5, sizeSm: 14, lh: 1.5, ls: '0.01em', weight: 400 },
  /** Uppercase mono kicker above headings */
  kicker: { size: 13, sizeSm: 12, lh: 1.6, ls: '0.14em', weight: 600 },
  fonts: {
    heading: 'var(--font-grotesk)', // Schibsted Grotesk
    body: 'var(--font-grotesk)',
    mono: 'var(--font-receipt)' // JetBrains Mono — kickers, receipt bodies, labels
  }
} as const;

/** Spacing rhythm (px). Sections are full-viewport panels like the reference. */
export const space = {
  /** Horizontal page gutter: 24 mobile / 44 tablet / 86 desktop */
  gutter: { base: 24, md: 44, xl: 86 },
  /** Max content width measured at 1440 (1268 px content box) */
  contentMax: 1268,
  /** Header height */
  header: 92,
  /** Vertical padding inside full-height panels */
  panelY: 96,
  /** Gap between stacked cards */
  cardGap: 16
} as const;

export const radius = {
  /** Pills — buttons, badges, tabs */
  pill: 9999,
  /** Cards (business grid, price stat cards) */
  card: 16,
  /** Large surfaces (order product card, images) */
  surface: 20,
  /** Device mockups */
  device: 28
} as const;

/** Control proportions measured on the reference. */
export const control = {
  buttonHeight: 48,
  buttonPaddingX: 22,
  buttonFontSize: 14.5,
  inputHeight: 48,
  iconTile: 44
} as const;

export const breakpoints = {
  /** Single column, sticky bottom CTA bar */
  mobile: 0,
  /** Two-column compare, wider gutters */
  md: 768,
  /** Full three-column hero rails, side-by-side sections */
  lg: 1024,
  xl: 1280
} as const;

export const motionTokens = {
  /** Standard reveal: fade + 28 px rise */
  reveal: { y: 28, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  /** Panel swap inside the scrollytelling hero */
  swap: { duration: 0.45, ease: [0.32, 0.72, 0, 1] as const },
  /** Springs for the phone screen carousel */
  spring: { stiffness: 170, damping: 26 },
  /** Respect prefers-reduced-motion everywhere (see globals.css) */
  reducedMotionQuery: '(prefers-reduced-motion: reduce)'
} as const;

export const tokens = { color, type, space, radius, control, breakpoints, motion: motionTokens };
export default tokens;
