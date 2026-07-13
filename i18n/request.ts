import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['da', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'da';

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get('locale')?.value;
  const locale = locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
